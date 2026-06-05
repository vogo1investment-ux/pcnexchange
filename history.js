import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const historyList = document.getElementById("historyList");
let activeType = "all";
let allTransactions = [];
let userUid = null;

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = "index.html"; return; }
  userUid = user.uid;
  loadUserTransactions(userUid);
});

// Load both subcollection and pendingTransactions
function loadUserTransactions(uid) {
  // Subcollection transactions
  const txnRef = collection(db, "users", uid, "transactions");
  const q1 = query(txnRef, orderBy("timestamp", "desc"));
  onSnapshot(q1, snap => {
    allTransactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderHistory();
  });

  // Pending Transactions (deposits/withdrawals/wallet requests)
  const pendingRef = collection(db, "pendingTransactions");
  const q2 = query(pendingRef, where("userId", "==", uid), orderBy("createdAt", "desc"));
  onSnapshot(q2, snap => {
    const pendingTxns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    allTransactions = [...allTransactions.filter(tx => tx.type !== "deposit" && tx.type !== "withdraw"), ...pendingTxns];
    renderHistory();
  });
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
  if (activeType !== "all") transactions = transactions.filter(tx => (tx.type || "").toLowerCase() === activeType);
  if (!transactions.length) { historyList.innerHTML = "<p>No transactions found.</p>"; return; }

  transactions.forEach(tx => {
    const date = tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : new Date(tx.timestamp).toLocaleString();
    const amountColor = tx.type === "withdraw" ? "#ff4444" : "#00ff66";
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <strong>${tx.type?.toUpperCase() || "Transaction"}</strong>
      <p>Date: ${date}</p>
      <p>Amount: <span style="color:${amountColor}">${tx.amount || 0}</span></p>
      ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
      ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
      ${tx.status ? `<p>Status: ${tx.status}</p>` : ""}
    `;
    historyList.appendChild(card);
  });
}