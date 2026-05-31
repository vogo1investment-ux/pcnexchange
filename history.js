import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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

// Force persistent login
setPersistence(auth, browserLocalPersistence);

let historyList = document.getElementById("historyList");
let activeType = "all";
let allTransactions = [];
let userUid = null;

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUid = user.uid;
  loadTransactions(userUid);
});

// Load both array and subcollection
function loadTransactions(uid) {
  const userRef = doc(db, "users", uid);
  onSnapshot(userRef, snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (Array.isArray(data.transactions)) {
      allTransactions = [...data.transactions];
      renderHistory();
    }
  });

  const transRef = collection(db, "users", uid, "transactions");
  const q = query(transRef, orderBy("timestamp", "desc"));
  onSnapshot(q, snap => {
    const subTransactions = [];
    snap.forEach(doc => subTransactions.push({ id: doc.id, ...doc.data() }));
    if (subTransactions.length > 0) {
      allTransactions = subTransactions;
      renderHistory();
    }
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
    if (tx.type === "transfer") amountColor = "#1E90FF";
    if (tx.status === "pending") amountColor = "#FFA500"; // orange pending

    let dateText = "No Date";
    try {
      if (tx.timestamp.toDate) dateText = tx.timestamp.toDate().toLocaleString();
      else dateText = new Date(tx.timestamp).toLocaleString();
    } catch(e) {}

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
      </div>
      <div class="history-amount" style="color:${amountColor}">$${Number(tx.amount || 0).toLocaleString()}</div>
    `;
    historyList.appendChild(card);
  });
}