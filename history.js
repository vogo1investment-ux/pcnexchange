import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase Config
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

const historyList = document.getElementById("historyList");
let allTransactions = [];
let activeType = "all";

// AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  const uid = user.uid;

  const userRef = doc(db, "users", uid);

  // Array transactions in user doc
  onSnapshot(userRef, snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (Array.isArray(data.transactions)) {
      allTransactions = [...data.transactions];
      renderHistory();
    }
  });

  // Subcollection transactions
  const transRef = collection(db, "users", uid, "transactions");
  const q = query(transRef, orderBy("timestamp", "desc"));
  onSnapshot(q, snapshot => {
    const subTransactions = [];
    snapshot.forEach(doc => subTransactions.push({ id: doc.id, ...doc.data() }));
    if (subTransactions.length > 0) {
      allTransactions = subTransactions;
      renderHistory();
    }
  });
});

// TABS
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    renderHistory();
  });
});

// RENDER
function renderHistory() {
  historyList.innerHTML = "";
  let transactions = allTransactions;

  if (activeType !== "all") {
    transactions = transactions.filter(item => (item.type || "").toLowerCase() === activeType);
  }

  if (transactions.length === 0) {
    historyList.innerHTML = `<div class="history-card"><p>No transactions found</p></div>`;
    return;
  }

  transactions.forEach(tx => {
    let amountColor = "#00ff66"; // green for deposit/receive
    if (tx.type === "withdraw" || tx.type === "withdrawal") amountColor = "#ff4444";
    if (tx.type === "transfer") amountColor = "#1E90FF"; // blue

    let dateText = "No Date";
    if (tx.timestamp) {
      try {
        dateText = tx.timestamp.toDate ? tx.timestamp.toDate().toLocaleString() : new Date(tx.timestamp).toLocaleString();
      } catch(e){}
    }

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-info">
        <strong>${(tx.type || "Transaction").toUpperCase()}</strong>
        <small>${dateText}</small>
        ${tx.to ? `<p>To: ${tx.to}</p>` : ""}
        ${tx.from ? `<p>From: ${tx.from}</p>` : ""}
        ${tx.email ? `<p>Email: ${tx.email}</p>` : ""}
        ${tx.wallet ? `<p>Wallet: ${tx.wallet}</p>` : ""}
        ${tx.status ? `<p>Status: ${tx.status}</p>` : ""}
      </div>
      <div class="history-amount" style="color:${amountColor}">
        $${Number(tx.amount || 0).toLocaleString()}
      </div>
    `;
    historyList.appendChild(card);
  });
}