import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
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
    const authStatus = document.getElementById("authStatus");
    const usersList = document.getElementById("usersList");
    const requestsContainer = document.getElementById("requestsContainer");
    const loadRequestsBtn = document.getElementById("loadRequestsBtn");
    const messageDiv = document.getElementById("message");

    onAuthStateChanged(auth, async (user) => {
        if (!user || user.uid !== ADMIN_UID) {
            authStatus.innerHTML = "❌ Access Denied";
            authStatus.className = "status error";
            return;
        }

        authStatus.innerHTML = "✅ Admin Connected";
        authStatus.className = "status success";

        loadAllUsers();
    });

    // Load Users + Their Coins
    async function loadAllUsers() {
        usersList.innerHTML = "<p>Loading users...</p>";
        try {
            const usersSnap = await getDocs(collection(db, "users"));   // ← Looking here for users

            usersList.innerHTML = "";

            if (usersSnap.empty) {
                usersList.innerHTML = "<p>No users found in 'users' collection.</p>";
                return;
            }

            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;

                // Load coins for this user
                let coinsHTML = "<p style='color:#888'>No coins yet</p>";
                try {
                    const coinsSnap = await getDocs(collection(db, `users/${userId}/coins`));  // ← Looking here for coins
                    if (!coinsSnap.empty) {
                        coinsHTML = coinsSnap.docs.map(d => `
                            <div class="coin-balance"><strong>${d.id}:</strong> ${d.data().amount || 0}</div>
                        `).join('');
                    }
                } catch(e) { console.error(e); }

                const card = document.createElement("div");
                card.className = "user-card";
                card.innerHTML = `
                    <div class="user-header"><strong>User:</strong> ${userId}</div>
                    <div style="margin:10px 0;">${coinsHTML}</div>
                    <div class="add-section">
                        <select class="coin-select">
                            <option value="">Select Coin</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="USDT">USDT</option>
                        </select>
                        <input type="number" step="0.00000001" placeholder="Amount" class="amount-input">
                        <button class="add-coin-btn">Add Coins</button>
                    </div>
                `;

                const addBtn = card.querySelector(".add-coin-btn");
                const coinSel = card.querySelector(".coin-select");
                const amtInput = card.querySelector(".amount-input");

                addBtn.addEventListener("click", async () => {
                    const coinId = coinSel.value;
                    const amount = parseFloat(amtInput.value);

                    if (!coinId || !amount || amount <= 0) {
                        showMessage("Select coin and amount", "error");
                        return;
                    }

                    try {
                        await setDoc(doc(db, `users/\( {userId}/coins/ \){coinId}`), {
                            amount: amount,
                            lastUpdated: serverTimestamp()
                        }, { merge: true });

                        showMessage(`✅ Added ${amount} ${coinId} to ${userId}`, "success");
                        loadAllUsers();
                    } catch (err) {
                        console.error(err);
                        showMessage("Failed to add coins", "error");
                    }
                });

                usersList.appendChild(card);
            }
        } catch (err) {
            console.error(err);
            usersList.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        }
    }

    // Load Pending Transactions
    loadRequestsBtn.addEventListener("click", async () => {
        requestsContainer.innerHTML = "<p>Loading from pendingTransactions...</p>";
        try {
            const snap = await getDocs(collection(db, "pendingTransactions"));   // ← Looking here for pending requests
            requestsContainer.innerHTML = "";

            if (snap.empty) {
                requestsContainer.innerHTML = "<p>No pending transactions found.</p>";
                return;
            }

            snap.forEach(docSnap => {
                const data = docSnap.data();
                const div = document.createElement("div");
                div.className = "request-card";
                div.innerHTML = `
                    <p><strong>User:</strong> ${data.userId || 'N/A'}</p>
                    <p><strong>Coin:</strong> ${data.coinId || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${data.amount || 'N/A'}</p>
                `;
                requestsContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            requestsContainer.innerHTML = `<p>Error: ${err.message}</p>`;
        }
    });

    function showMessage(text, type) {
        messageDiv.innerHTML = text;
        messageDiv.style.color = type === "success" ? "#00ff88" : "#ff6666";
        setTimeout(() => messageDiv.innerHTML = "", 5000);
    }
});