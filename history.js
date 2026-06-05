import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const txList = document.getElementById("txList");
let activeType = "all";
let userId = null;

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";
  userId = user.uid;
  loadUserTransactions(userId);
});

// Tabs
document.querySelectorAll(".tx-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    activeType = btn.dataset.type;
    document.querySelectorAll(".tx-tab").forEach(t => t.classList.remove("bg-green-800"));
    btn.classList.add("bg-green-800");
    renderTransactions();
  });
});

let allTxs = [];

// Load transactions
function loadUserTransactions(uid) {
  const q = query(collection(db, "pendingTransactions"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  onSnapshot(q, snap => {
    allTxs = [];
    snap.forEach(doc => allTxs.push({ id: doc.id, ...doc.data() }));
    renderTransactions();
  });
}

function renderTransactions() {
  txList.innerHTML = "";
  let filtered = activeType === "all" ? allTxs : allTxs.filter(tx => tx.type.toLowerCase() === activeType);

  if (!filtered.length) {
    txList.innerHTML = `<p>No transactions found</p>`;
    return;
  }

  filtered.forEach(tx => {
    const card = document.createElement("div");
    card.className = "p-4 bg-zinc-900 border border-zinc-700 rounded-xl";
    card.innerHTML = `
      <p><strong>Type:</strong> ${tx.type}</p>
      <p><strong>Amount:</strong> $${tx.amount}</p>
      <p><strong>Method:</strong> ${tx.method || "-"}</p>
      <p><strong>Status:</strong> ${tx.status}</p>
      <p><strong>Recipient:</strong> ${tx.recipient || "-"}</p>
      <p><strong>Date:</strong> ${tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : "-"}</p>
    `;
    txList.appendChild(card);
  });
}