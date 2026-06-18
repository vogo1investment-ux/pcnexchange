import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const loadBtn = document.getElementById("loadRequestsBtn");
    const addBtn = document.getElementById("addCoinBtn");
    const requestsContainer = document.getElementById("requestsContainer");
    const messageDiv = document.getElementById("message");
    const userSelect = document.getElementById("userSelect");
    const coinSelect = document.getElementById("coinSelect");
    const amountInput = document.getElementById("coinAmount");
    const authStatus = document.getElementById("authStatus");

    // Auth Check
    onAuthStateChanged(auth, async (user) => {
        if (!user || user.uid !== ADMIN_UID) {
            authStatus.innerHTML = "❌ Access Denied. Admin only.";
            authStatus.className = "status error";
            loadBtn.disabled = true;
            addBtn.disabled = true;
            return;
        }

        currentUser = user;
        authStatus.innerHTML = "✅ Admin Access Granted";
        authStatus.className = "status success";
        loadBtn.disabled = false;
        addBtn.disabled = false;

        // Load users and coins for dropdowns
        await loadDropdowns();
    });

    // Load Pending Coin Requests
    loadBtn.addEventListener("click", async () => {
        requestsContainer.innerHTML = "<p>Loading requests...</p>";
        
        try {
            const snap = await getDocs(collection(db, "pendingCoins"));
            requestsContainer.innerHTML = "";

            if (snap.empty) {
                requestsContainer.innerHTML = "<p>No pending coin requests found.</p>";
                return;
            }

            snap.forEach(docSnap => {
                const data = docSnap.data();
                const card = document.createElement("div");
                card.className = "request-card";
                card.innerHTML = `
                    <p><strong>User ID:</strong> ${data.userId || 'N/A'}</p>
                    <p><strong>Coin:</strong> ${data.coinId || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${data.amount || 'N/A'}</p>
                    <p><strong>Status:</strong> ${data.status || 'pending'}</p>
                    <small>Request ID: ${docSnap.id}</small>
                `;
                requestsContainer.appendChild(card);
            });
        } catch (error) {
            console.error(error);
            requestsContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    // Manual Coin Credit
    addBtn.addEventListener("click", async () => {
        const userId = userSelect.value;
        const coinId = coinSelect.value;
        const amount = parseFloat(amountInput.value);

        if (!userId || !coinId || !amount || amount <= 0) {
            showMessage("Please fill all fields correctly.", "error");
            return;
        }

        try {
            const coinRef = doc(db, `users/\( {userId}/coins/ \){coinId}`);
            
            await setDoc(coinRef, {
                coinId: coinId,
                amount: amount,
                lastUpdated: serverTimestamp()
            }, { merge: true });

            showMessage(`✅ Successfully credited ${amount} ${coinId} to user ${userId}`, "success");
            amountInput.value = "";
        } catch (error) {
            console.error(error);
            showMessage(`Error: ${error.message}`, "error");
        }
    });

    async function loadDropdowns() {
        try {
            // Load Users
            const usersSnap = await getDocs(collection(db, "users"));
            userSelect.innerHTML = '<option value="">Select User</option>';
            usersSnap.forEach(docSnap => {
                const userId = docSnap.id;
                const option = document.createElement("option");
                option.value = userId;
                option.textContent = userId;
                userSelect.appendChild(option);
            });

            // Load Coins
            const coinsSnap = await getDocs(collection(db, "coins"));
            coinSelect.innerHTML = '<option value="">Select Coin</option>';
            coinsSnap.forEach(docSnap => {
                const coinId = docSnap.id;
                const option = document.createElement("option");
                option.value = coinId;
                option.textContent = coinId;
                coinSelect.appendChild(option);
            });
        } catch (e) {
            console.error("Failed to load dropdowns", e);
        }
    }

    function showMessage(text, type) {
        messageDiv.innerHTML = text;
        messageDiv.className = type === "success" ? "success" : "error";
        setTimeout(() => messageDiv.innerHTML = "", 5000);
    }
});