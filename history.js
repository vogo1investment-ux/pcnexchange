import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Force persistent login
setPersistence(auth, browserLocalPersistence);

const historyList = document.getElementById("historyList");
let activeType = "all";
let allTransactions = [];
let userUid = null;

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = "index.html"; return; }
  userUid = user.uid;
  loadTransactions(userUid);
});

// Load transactions from multiple collections
function loadTransactions(uid) {
  allTransactions = [];

  // Pending Transactions (Deposits & Withdrawals)
  const pendingQ = query(collection(db, "pendingTransactions"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  onSnapshot(pendingQ, snap => {
    const pending = snap.docs.map(doc => ({ id: doc.id, type: doc.data().type, status: doc.data().status, amount: doc.data().amount, method: doc.data().method, region: doc.data().region, timestamp: doc.data().createdAt }));
    allTransactions = mergeTransactions(allTransactions, pending);
    renderHistory();
  });

  // Stakes
  const stakesQ = query(collection(db, "stakes"), where("userId", "==", uid), orderBy("timestamp", "desc"));
  onSnapshot(stakesQ, snap => {
    const stakes = snap.docs.map(doc => ({ id: doc.id, type: "stake", status: doc.data().status, amount: doc.data().amount, timestamp: doc.data().timestamp }));
    allTransactions = mergeTransactions(allTransactions, stakes);
    renderHistory();
  });

  // TODO: Add other collections like transfers/received if needed
}

// Merge without duplicates
function mergeTransactions(arr1, arr2) {
  const map = new Map(arr1.map(tx => [tx.id, tx]));
  arr2.forEach(tx => map.set(tx.id, tx));
  return Array.from(map.values()).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
}

// Tabs
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    renderHistory();
  });
});

// Render
function renderHistory() {
  historyList.innerHTML = "";
  let transactions = allTransactions;

  if (activeType !== "all") {
    transactions = transactions.filter(tx => (tx.type || "").toLowerCase() === activeType);
  }

  if (!transactions.length) {
    historyList.innerHTML = `<div class="history-card"><p>No transactions found</p></div>`;
    return;
  }

  transactions.forEach(tx => {
    let amountColor = "#00ff66"; // green
    if (tx.type === "withdraw") amountColor = "#ff4444";
    if (tx.type === "deposit") amountColor = "#00ffcc";
    if (tx.type === "transfer") amountColor = "#1E90FF";
    if (tx.type === "stake") amountColor = "#FFA500";

    let dateText = "No Date";
    try {
      if (tx.timestamp?.toDate) dateText = tx.timestamp.toDate().toLocaleString();
      else if (tx.timestamp) dateText = new Date(tx.timestamp.seconds ? tx.timestamp.seconds*1000 : tx.timestamp).toLocaleString();
    } catch(e){}

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-info">
        <strong>${(tx.type || "Transaction").toUpperCase()}</strong>
        <small>${dateText}</small>
        ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
        ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
        ${tx.status ? `<p>Status: ${tx.status}</p>` : ""}
      </div>
      <div class="history-amount" style="color:${amountColor}">$${Number(tx.amount || 0).toLocaleString()}</div>
    `;
    historyList.appendChild(card);
  });
}