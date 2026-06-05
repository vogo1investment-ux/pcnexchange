import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

let historyList = document.getElementById("historyList");
let activeType = "all";
let allTransactions = [];
let userUid = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUid = user.uid;
  loadAllTransactions(userUid);
});

// Fetch all transaction sources
function loadAllTransactions(uid) {
  allTransactions = [];

  // 1. Pending Transactions (Deposits + Withdrawals + Wallet requests)
  const pendingRef = collection(db, "pendingTransactions");
  onSnapshot(pendingRef, snap => {
    const pendingTx = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.userId === uid) pendingTx.push({ id: docSnap.id, ...data });
    });
    mergeTransactions(pendingTx);
  });

  // 2. Stakes
  const stakesRef = collection(db, "stakes");
  onSnapshot(stakesRef, snap => {
    const stakeTx = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.userId === uid) stakeTx.push({ id: docSnap.id, ...data, type: "stake" });
    });
    mergeTransactions(stakeTx);
  });

  // 3. User transactions subcollection (transfers & received)
  const userTransRef = collection(db, "users", uid, "transactions");
  const q = query(userTransRef, orderBy("timestamp", "desc"));
  onSnapshot(q, snap => {
    const userTx = [];
    snap.forEach(docSnap => userTx.push({ id: docSnap.id, ...docSnap.data() }));
    mergeTransactions(userTx);
  });
}

// Merge arrays while avoiding duplicates
function mergeTransactions(newTx) {
  const txMap = new Map();
  [...allTransactions, ...newTx].forEach(tx => txMap.set(tx.id, tx));
  allTransactions = Array.from(txMap.values()).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  renderHistory();
}

// Tab switching
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
    let amountColor = "#00ff66"; // green for deposit/received
    if (tx.type === "withdraw") amountColor = "#ff4444";
    if (tx.type === "transfer") amountColor = "#1E90FF";
    if (tx.type === "stake") amountColor = "#FFA500";
    if (tx.status === "pending") amountColor = "#FFA500"; // pending

    let dateText = "No Date";
    try {
      if (tx.timestamp?.toDate) dateText = tx.timestamp.toDate().toLocaleString();
      else if (tx.timestamp) dateText = new Date(tx.timestamp).toLocaleString();
    } catch(e){}

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-info">
        <strong>${(tx.type || "Transaction").toUpperCase()}</strong>
        <small>${dateText}</small>
        ${tx.to ? `<p>To: ${tx.to}</p>` : ""}
        ${tx.from ? `<p>From: ${tx.from}</p>` : ""}
        ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
        ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
        ${tx.status ? `<p>Status: ${tx.status}</p>` : ""}
        ${tx.amount ? `<p>Amount: $${Number(tx.amount).toLocaleString()}</p>` : ""}
      </div>
      <div class="history-amount" style="color:${amountColor}">${tx.type === "stake" ? `Staked: ${tx.stakeAmount || 0}` : `$${Number(tx.amount || 0).toLocaleString()}`}</div>
    `;
    historyList.appendChild(card);
  });
}