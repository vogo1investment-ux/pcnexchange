import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const historyTableBody = document.getElementById("historyTableBody");
const tabButtons = document.querySelectorAll(".tab-btn");

let currentType = "all";
let currentUserId = null;

// Tabs
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;

    tabButtons.forEach(b => b.classList.remove("bg-emerald-500"));
    btn.classList.add("bg-emerald-500");

    if (currentUserId) loadAllHistory(currentUserId);
  });
});

// Auth
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUserId = user.uid;
  loadAllHistory(user.uid);
});

// MAIN LOADER (FIX)
function loadAllHistory(uid) {
  historyTableBody.innerHTML = `
    <tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>
  `;

  let allTransactions = [];

  // 1. USER SUBCOLLECTION
  const userTxRef = collection(db, "users", uid, "transactions");
  const q1 = query(userTxRef, orderBy("timestamp", "desc"));

  onSnapshot(q1, (snap1) => {
    allTransactions = [];

    snap1.forEach(doc => {
      allTransactions.push(doc.data());
    });

    render(allTransactions);
  }, (err) => {
    console.log("User tx error:", err);
  });

  // 2. ROOT PENDING TRANSACTIONS
  const rootTxRef = collection(db, "pendingTransactions");
  const q2 = query(rootTxRef, where("userId", "==", uid));

  onSnapshot(q2, (snap2) => {
    snap2.forEach(doc => {
      const data = doc.data();
      allTransactions.push(data);
    });

    render(allTransactions);
  }, (err) => {
    console.log("Root tx error:", err);
  });
}

// FILTER + RENDER
function render(txns) {
  historyTableBody.innerHTML = "";

  let filtered = txns.filter(t => {
    if (!t.type) return false;

    const type = t.type.toLowerCase();

    if (currentType === "all") return true;
    if (currentType === "deposits") return type.includes("deposit");
    if (currentType === "withdrawals") return type.includes("withdraw");
    if (currentType === "stakes") return type.includes("stake");
    if (currentType === "transfers") return type.includes("transfer");
    if (currentType === "received") return type.includes("receive");

    return true;
  });

  if (filtered.length === 0) {
    historyTableBody.innerHTML = `
      <tr><td colspan="5" class="p-4 text-center">No transactions found</td></tr>
    `;
    return;
  }

  filtered.forEach(t => {
    const date = t.timestamp?.toDate?.()
      || new Date(t.createdAt?.seconds * 1000)
      || new Date();

    historyTableBody.innerHTML += `
      <tr class="bg-zinc-900">
        <td class="p-2 border border-zinc-700">${t.type || "-"}</td>
        <td class="p-2 border border-zinc-700">${t.amount || 0}</td>
        <td class="p-2 border border-zinc-700">${t.method || t.coinOrPayment || "-"}</td>
        <td class="p-2 border border-zinc-700">${t.status || "Pending"}</td>
        <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
      </tr>
    `;
  });
}