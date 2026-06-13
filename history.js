import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const historyTableBody = document.getElementById("historyTableBody");

let allTransactions = [];

// LOGIN CHECK
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadHistory(user.uid);
});

// LOAD ALL HISTORY
function loadHistory(uid) {
  historyTableBody.innerHTML =
    `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

  allTransactions = [];

  // 1. USER OWN TRANSACTIONS
  const userTxnRef = collection(db, "users", uid, "transactions");
  const q1 = query(userTxnRef);

  onSnapshot(q1, (snap) => {
    syncData(snap, uid);
  });

  // 2. GLOBAL PENDING TRANSACTIONS (deposit/withdraw/admin created)
  const pendingRef = collection(db, "pendingTransactions");
  const q2 = query(pendingRef, where("userId", "==", uid));

  onSnapshot(q2, (snap) => {
    syncData(snap, uid);
  });
}

// MERGE DATA FROM BOTH SOURCES
function syncData(snapshot, uid) {
  snapshot.forEach(doc => {
    const data = doc.data();

    const item = {
      type: data.type || "unknown",
      amount: data.amount || 0,
      method: data.method || "-",
      status: data.status || "pending",
      timestamp: data.createdAt?.toDate?.() || new Date(),
      raw: data
    };

    // avoid duplicates
    const exists = allTransactions.find(t =>
      t.timestamp?.getTime?.() === item.timestamp?.getTime?.() &&
      t.amount === item.amount &&
      t.type === item.type
    );

    if (!exists) allTransactions.push(item);
  });

  renderHistory();
}

// RENDER UI
function renderHistory() {
  if (!allTransactions.length) {
    historyTableBody.innerHTML =
      `<tr><td colspan="5" style="text-align:center;">No history found</td></tr>`;
    return;
  }

  // sort newest first
  allTransactions.sort((a, b) => b.timestamp - a.timestamp);

  historyTableBody.innerHTML = "";

  allTransactions.forEach(t => {
    historyTableBody.innerHTML += `
      <tr>
        <td>${t.type}</td>
        <td>${t.amount}</td>
        <td>${t.method}</td>
        <td>${t.status}</td>
        <td>${new Date(t.timestamp).toLocaleString()}</td>
      </tr>
    `;
  });
}