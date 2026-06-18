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
    const coinSelect = document.getElementById("coinSelect");
    const amountInput = document.getElementById("coinAmount");
    const messageDiv = document.getElementById("message");
    const loadBtn = document.getElementById("loadRequestsBtn");

    onAuthStateChanged(auth, async (user) => {
        if (!user || user.uid !== ADMIN_UID) {
            authStatus.innerHTML = "❌ Not Admin";
            authStatus.className = "status error";
            return;
        }

        authStatus.innerHTML = "✅ Admin Connected";
        authStatus.className = "status success";

        loadCoins();
        loadUsersAndCoins();
    });

    async function loadCoins() {
        try {
            const snap = await getDocs(collection(db, "coins"));
            coinSelect.innerHTML = '<option value="">Select Coin</option>';
            snap.forEach(doc => {
                const opt = new Option(doc.id, doc.id);
                coinSelect.appendChild(opt);
            });
        } catch(e) { console.error("Coins load failed", e); }
    }

    async function loadUsersAndCoins() {
        usersList.innerHTML = "<p style='color:#00ff88'>Loading users...</p>";
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            usersList.innerHTML = "";

            if (usersSnap.empty) {
                usersList.innerHTML = "<p>No users found.</p>";
                return;
            }

            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;
                let coinHTML = "";

                try {
                    const coinsSnap = await getDocs(collection(db, `users/${userId}/coins`));
                    if (!coinsSnap.empty) {
                        coinHTML = coinsSnap.docs.map(d => `
                            <div class="coin-balance"><strong>${d.id}:</strong> ${d.data().amount || 0}</div>
                        `).join('');
                    } else {
                        coinHTML = '<p style="color:#888">No coins</p>';
                    }
                } catch(e) {
                    coinHTML = '<p style="color:#ff6666">Error loading coins</p>';
                }

                const card = document.createElement("div");
                card.className = "user-card";
                card.innerHTML = `
                    <div class="user-header">
                        <strong>${userId}</strong>
                        <button class="add-btn" data-user="${userId}">Add Coins</button>
                    </div>
                    <div class="coin-balances">${coinHTML}</div>
                `;

                card.querySelector(".add-btn").onclick = () => addCoins(userId);
                usersList.appendChild(card);
            }
        } catch (e) {
            console.error("Main error:", e);
            usersList.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
        }
    }

    async function addCoins(userId) {
        const coinId = coinSelect.value;
        const amount = parseFloat(amountInput.value);

        if (!coinId || !amount || amount <= 0) {
            showMessage("Select coin and amount", "error");
            return;
        }

        try {
            await setDoc(doc(db, `users/\( {userId}/coins/ \){coinId}`), {
                coinId,
                amount: amount,
                lastUpdated: serverTimestamp()
            }, { merge: true });

            showMessage(`✅ Added ${amount} ${coinId} to ${userId}`, "success");
            loadUsersAndCoins(); // refresh
            amountInput.value = "";
        } catch (e) {
            console.error(e);
            showMessage("Permission error or network issue", "error");
        }
    }

    function showMessage(msg, type) {
        messageDiv.innerHTML = msg;
        messageDiv.style.color = type === "success" ? "#00ff88" : "#ff6666";
        setTimeout(() => messageDiv.innerHTML = "", 5000);
    }

    // Pending requests
    loadBtn.addEventListener("click", async () => {
        const container = document.getElementById("requestsContainer");
        container.innerHTML = "Loading...";
        try {
            const snap = await getDocs(collection(db, "pendingCoins"));
            container.innerHTML = "";
            snap.forEach(d => {
                const data = d.data();
                const div = document.createElement("div");
                div.className = "request-card";
                div.innerHTML = `<p>User: ${data.userId} | Coin: ${data.coinId} | Amount: ${data.amount}</p>`;
                container.appendChild(div);
            });
            if (snap.empty) container.innerHTML = "No pending requests";
        } catch(e) {
            container.innerHTML = "Error loading requests";
        }
    });
});