import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, query, orderBy, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const historyList = document.getElementById("historyList");
let activeType = "all";
let userUid = null;
let allTransactions = [];

// Auth listener
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUid = user.uid;
  loadAllTransactions();
});

// Tabs click
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    renderHistory();
  });
});

// Load all types of transactions
async function loadAllTransactions() {
  allTransactions = [];

  // 1. User subcollection transactions
  const userTransRef = collection(db, "users", userUid, "transactions");
  onSnapshot(query(userTransRef, orderBy("timestamp", "desc")), snap => {
    snap.forEach(docSnap => {
      allTransactions.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderHistory();
  });

  // 2. Pending transactions (Deposit/Withdrawal/Receive)
  const pendingRef = collection(db, "pendingTransactions");
  onSnapshot(query(pendingRef, orderBy("createdAt", "desc"), where("userId", "==", userUid)), snap => {
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const typeMap = { "deposit": "deposit", "withdraw": "withdrawal", "received": "received" };
      const type = typeMap[data.type] || data.type || "pending";
      allTransactions.push({ id: docSnap.id, ...data, type });
    });
    renderHistory();
  });

  // 3. Stakes
  const stakesRef = collection(db, "stakes");
  onSnapshot(query(stakesRef, where("userId", "==", userUid), orderBy("createdAt", "desc")), snap => {
    snap.forEach(docSnap => {
      allTransactions.push({ id: docSnap.id, type: "stake", ...docSnap.data() });
    });
    renderHistory();
  });
}

// Render function
function renderHistory() {
  historyList.innerHTML = "";

  let txs = allTransactions.slice(); // copy

  if (activeType !== "all") {
    txs = txs.filter(tx => (tx.type || "").toLowerCase() === activeType);
  }

  if (!txs.length) {
    historyList.innerHTML = `<div class="history-card"><p>No transactions found</p></div>`;
    return;
  }

  txs.sort((a,b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds*1000 : 0);
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds*1000 : 0);
    return bTime - aTime;
  });

  txs.forEach(tx => {
    let amountColor = "#00ff66"; // green default
    if (tx.type === "withdrawal") amountColor = "#ff4444";
    if (tx.type === "transfer") amountColor = "#1E90FF";
    if (tx.type === "stake") amountColor = "#FFD700";
    if (tx.status?.toLowerCase() === "pending") amountColor = "#FFA500";

    let dateText = "No Date";
    try {
      if (tx.createdAt?.toDate) dateText = tx.createdAt.toDate().toLocaleString();
      else if (tx.createdAt?.seconds) dateText = new Date(tx.createdAt.seconds*1000).toLocaleString();
    } catch(e) {}

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-info">
        <strong>${(tx.type || "Transaction").toUpperCase()}</strong>
        <small>${dateText}</small>
        ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
        ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
        ${tx.recipient ? `<p>Recipient: ${tx.recipient}</p>` : ""}
        ${tx.amount !== undefined ? `<p>Amount: $${tx.amount}</p>` : ""}
        ${tx.status ? `<p>Status: ${tx.status}</p>` : ""}
      </div>
      <div class="history-amount" style="color:${amountColor}">$${Number(tx.amount || 0).toLocaleString()}</div>
    `;
    historyList.appendChild(card);
  });
}