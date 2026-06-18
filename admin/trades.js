import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
    authDomain: "pcnexchange.firebaseapp.com",
    projectId: "pcnexchange",
    storageBucket: "pcnexchange.firebasestorage.app",
    messagingSenderId: "278761036604",
    appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

document.addEventListener("DOMContentLoaded", () => {
    const loadBtn = document.getElementById("loadRequestsBtn");
    const coinSelect = document.getElementById("coinSelect");
    const amountInput = document.getElementById("coinAmount");
    const usersList = document.getElementById("usersList");
    const messageDiv = document.getElementById("message");
    const authStatus = document.getElementById("authStatus");

    let isAdmin = false;

    onAuthStateChanged(auth, async (user) => {
        if (!user || user.uid !== ADMIN_UID) {
            authStatus.innerHTML = "❌ Access Denied. Admin only.";
            authStatus.className = "status error";
            return;
        }

        isAdmin = true;
        authStatus.innerHTML = "✅ Admin Access Granted";
        authStatus.className = "status success";

        await loadCoinsDropdown();
        await loadAllUsers();
    });

    // Load Coin Dropdown
    async function loadCoinsDropdown() {
        try {
            const snap = await getDocs(collection(db, "coins"));
            coinSelect.innerHTML = '<option value="">Select Coin</option>';
            snap.forEach(d => {
                const opt = new Option(d.id, d.id);
                coinSelect.appendChild(opt);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Load All Users + Their Coins
    async function loadAllUsers() {
        usersList.innerHTML = "<p>Loading users...</p>";
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            usersList.innerHTML = "";

            if (usersSnap.empty) {
                usersList.innerHTML = "<p>No users found.</p>";
                return;
            }

            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;
                const userCoins = await getUserCoins(userId);

                const card = document.createElement("div");
                card.className = "user-card";
                card.innerHTML = `
                    <div class="user-header">
                        <strong>User ID:</strong> ${userId}
                        <button class="add-to-this-user" data-userid="${userId}">Add Coins →</button>
                    </div>
                    <div class="coin-balances">
                        ${userCoins.length ? userCoins.map(c => `
                            <div class="coin-balance">
                                <strong>${c.coinId}:</strong> ${c.amount}
                            </div>
                        `).join('') : '<p style="color:#888;">No coins yet</p>'}
                    </div>
                `;

                // Add button handler
                card.querySelector(".add-to-this-user").addEventListener("click", () => {
                    addCoinsToUser(userId);
                });

                usersList.appendChild(card);
            }
        } catch (e) {
            console.error(e);
            usersList.innerHTML = `<p style="color:red;">Error loading users: ${e.message}</p>`;
        }
    }

    async function getUserCoins(userId) {
        try {
            const coinsSnap = await getDocs(collection(db, `users/${userId}/coins`));
            return coinsSnap.docs.map(d => ({
                coinId: d.id,
                amount: d.data().amount || 0
            }));
        } catch (e) {
            return [];
        }
    }

    async function addCoinsToUser(userId) {
        const coinId = coinSelect.value;
        const amount = parseFloat(amountInput.value);

        if (!coinId || !amount || amount <= 0) {
            showMessage("Please select coin and enter valid amount", "error");
            return;
        }

        try {
            const coinRef = doc(db, `users/\( {userId}/coins/ \){coinId}`);
            await setDoc(coinRef, {
                coinId: coinId,
                amount: amount,
                lastUpdated: serverTimestamp()
            }, { merge: true });

            showMessage(`✅ Added ${amount} ${coinId} to ${userId}`, "success");
            await loadAllUsers(); // Refresh list
            amountInput.value = "";
        } catch (error) {
            console.error(error);
            showMessage(`Error: ${error.message}`, "error");
        }
    }

    // Pending Requests
    loadBtn.addEventListener("click", async () => {
        const container = document.getElementById("requestsContainer");
        container.innerHTML = "<p>Loading...</p>";
        try {
            const snap = await getDocs(collection(db, "pendingCoins"));
            container.innerHTML = "";
            if (snap.empty) {
                container.innerHTML = "<p>No pending requests.</p>";
                return;
            }
            snap.forEach(docSnap => {
                const data = docSnap.data();
                const div = document.createElement("div");
                div.className = "request-card";
                div.innerHTML = `
                    <p><strong>User:</strong> ${data.userId}</p>
                    <p><strong>Coin:</strong> ${data.coinId}</p>
                    <p><strong>Amount:</strong> ${data.amount}</p>
                    <p><strong>Status:</strong> ${data.status}</p>
                `;
                container.appendChild(div);
            });
        } catch (e) {
            container.innerHTML = `<p>Error: ${e.message}</p>`;
        }
    });

    function showMessage(text, type) {
        messageDiv.innerHTML = text;
        messageDiv.style.color = type === "success" ? "#00ff88" : "#ff6666";
        setTimeout(() => messageDiv.innerHTML = "", 6000);
    }
});