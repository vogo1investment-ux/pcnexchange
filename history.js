import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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
let allTransactions = [];
let userUid = null;

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUid = user.uid;
  loadTransactions(userUid);
  loadStakes(userUid);
});

// Tabs
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    renderHistory();
  });
});

// Load user transactions (deposits, withdrawals, wallet, transfer, receive)
function loadTransactions(uid) {
  const txRef = collection(db, "users", uid, "transactions");
  const q = query(txRef, orderBy("timestamp", "desc"));

  onSnapshot(q, snap => {
    snap.forEach(docSnap => {
      const tx = { id: docSnap.id, ...docSnap.data() };
      const existingIndex = allTransactions.findIndex(t => t.id === tx.id);
      if (existingIndex === -1) allTransactions.push(tx);
      else allTransactions[existingIndex] = tx;
    });
    renderHistory();
  });
}

// Load user stakes
function loadStakes(uid) {
  const stakeRef = collection(db, "stakes");
  const q = query(stakeRef, orderBy("timestamp", "desc"));

  onSnapshot(q, snap => {
    snap.forEach(docSnap => {
      const stake = { id: docSnap.id, ...docSnap.data() };
      // Only add stakes for this user
      if (stake.userId === uid) {
        const existingIndex = allTransactions.findIndex(t => t.id === stake.id);
        if (existingIndex === -1) allTransactions.push({ ...stake, type: "stake" });
        else allTransactions[existingIndex] = { ...stake, type: "stake" };
      }
    });
    renderHistory();
  });
}

// Render function
function renderHistory() {
  historyList.innerHTML = "";

  let transactions = activeType === "all" ? allTransactions : allTransactions.filter(tx => (tx.type || "").toLowerCase() === activeType);

  if (!transactions.length) {
    historyList.innerHTML = `<div class="history-card"><p>No transactions found</p></div>`;
    return;
  }

  transactions.forEach(tx => {
    let amountColor = "#00ff66"; // green default
    if (tx.type === "withdraw") amountColor = "#ff4444";
    if (tx.type === "stake") amountColor = "#1E90FF";
    if (tx.status === "pending") amountColor = "#FFA500"; // orange pending

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
        ${tx.stakeAmount ? `<p>Staked Amount: ${tx.stakeAmount}</p>` : ""}
        ${tx.stakeInterest ? `<p>Interest: ${tx.stakeInterest}%</p>` : ""}
        ${tx.stakeEndDate ? `<p>Ends: ${new Date(tx.stakeEndDate).toLocaleString()}</p>` : ""}
      </div>
      <div class="history-amount" style="color:${amountColor}">$${Number(tx.amount || 0).toLocaleString()}</div>
    `;
    historyList.appendChild(card);
  });
}