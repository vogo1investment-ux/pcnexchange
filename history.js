import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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

let userId = null;
const txList = document.getElementById("txList");
let activeType = "all";
let allTransactions = [];

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";
  userId = user.uid;
  loadAllTransactions(userId);
});

// Tab switching
document.querySelectorAll(".tx-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    activeType = tab.dataset.type;
    document.querySelectorAll(".tx-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderTransactions();
  });
});

// Load all transactions for user
function loadAllTransactions(uid) {
  allTransactions = [];

  // 1. Pending Transactions (deposits, withdrawals, stakes)
  const pendingRef = collection(db, "pendingTransactions");
  const pendingQuery = query(pendingRef, where("userId", "==", uid), orderBy("createdAt", "desc"));
  onSnapshot(pendingQuery, snapshot => {
    snapshot.forEach(doc => {
      const tx = { id: doc.id, ...doc.data(), source: "pending" };
      const index = allTransactions.findIndex(t => t.id === doc.id && t.source === "pending");
      if (index > -1) allTransactions[index] = tx;
      else allTransactions.push(tx);
    });
    renderTransactions();
  });

  // 2. Completed user transactions
  const userTxnRef = collection(db, "users", uid, "transactions");
  const userQuery = query(userTxnRef, orderBy("timestamp", "desc"));
  onSnapshot(userQuery, snapshot => {
    snapshot.forEach(doc => {
      const tx = { id: doc.id, ...doc.data(), source: "user" };
      const index = allTransactions.findIndex(t => t.id === doc.id && t.source === "user");
      if (index > -1) allTransactions[index] = tx;
      else allTransactions.push(tx);
    });
    renderTransactions();
  });
}

// Render transactions
function renderTransactions() {
  txList.innerHTML = "";

  let filtered = activeType === "all" ? allTransactions : allTransactions.filter(tx => (tx.type || "").toLowerCase() === activeType);

  if (!filtered.length) {
    txList.innerHTML = `<div class="tx-card"><p>No transactions found</p></div>`;
    return;
  }

  filtered.sort((a,b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : a.timestamp?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : b.timestamp?.toDate?.() || new Date(0);
    return bTime - aTime;
  });

  filtered.forEach(tx => {
    const dateText = tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() :
                     tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() :
                     "-";

    const amountColor = tx.type === "withdraw" ? "#ff4444" : "#00ff66";
    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="tx-info">
        <strong>Type:</strong> ${tx.type}<br>
        <strong>Status:</strong> ${tx.status || "Completed"}<br>
        <strong>Amount:</strong> $${tx.amount || 0}<br>
        ${tx.method ? `<strong>Method:</strong> ${tx.method}<br>` : ""}
        ${tx.recipient ? `<strong>Recipient:</strong> ${tx.recipient}<br>` : ""}
        <strong>Date:</strong> ${dateText}
      </div>
      <div class="tx-amount" style="color:${amountColor}">$${tx.amount || 0}</div>
    `;
    txList.appendChild(card);
  });
}