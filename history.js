import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// --- Firebase Config ---
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
const tabButtons = document.querySelectorAll(".tab-btn");

let currentType = "deposit"; // default tab

// Handle tab clicks
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    tabButtons.forEach(b => b.classList.remove("bg-emerald-500"));
    btn.classList.add("bg-emerald-500");
    loadTransactions();
  });
});

// Fetch transactions for logged-in user
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please login to see your transactions.");
    window.location.href = "login.html";
    return;
  }
  loadTransactions(user.uid);
});

async function loadTransactions(uid) {
  historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>`;

  try {
    // Query the user's transactions subcollection
    const txnCol = collection(db, "users", uid, "transactions");
    const txnQuery = query(txnCol, orderBy("timestamp", "desc"));
    const txnSnap = await getDocs(txnQuery);

    if (txnSnap.empty) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No transactions found.</td></tr>`;
      return;
    }

    // Filter by current type (deposit/withdrawal/stake/transfer/received)
    const txns = [];
    txnSnap.forEach(docSnap => {
      const t = docSnap.data();
      if (!t.type) return; // skip if type missing
      if (t.type.toLowerCase() === currentType.toLowerCase()) {
        txns.push(t);
      }
    });

    if (txns.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No ${currentType} transactions found.</td></tr>`;
      return;
    }

    // Render table rows
    historyTableBody.innerHTML = "";
    txns.forEach(t => {
      const date = t.timestamp?.toDate?.() || new Date();
      historyTableBody.innerHTML += `
        <tr class="bg-zinc-900 hover:bg-zinc-800">
          <td class="p-2 border border-zinc-700">${t.type || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.amount || 0}</td>
          <td class="p-2 border border-zinc-700">${t.method || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.status || "-"}</td>
          <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Failed to load transactions:", err);
    historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load transactions. Check console.</td></tr>`;
  }
}