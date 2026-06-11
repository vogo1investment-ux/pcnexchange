import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase Config
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

let currentType = "deposit"; // default

// --- Handle tab clicks ---
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    tabButtons.forEach(b => b.classList.remove("bg-emerald-500"));
    btn.classList.add("bg-emerald-500");
    loadTransactions();
  });
});

// --- Load transactions ---
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please login to view your transactions.");
    window.location.href = "login.html";
    return;
  }

  await loadTransactions();

  async function loadTransactions() {
    try {
      const txnCol = collection(db, "users", user.uid, "transactions");
      const txnQuery = query(txnCol, where("type", "==", currentType), orderBy("timestamp", "desc"));
      const txnSnapshot = await getDocs(txnQuery);

      if (txnSnapshot.empty) {
        historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No ${currentType} transactions found.</td></tr>`;
        return;
      }

      historyTableBody.innerHTML = "";
      txnSnapshot.forEach(docSnap => {
        const txn = docSnap.data();
        const date = txn.timestamp ? new Date(txn.timestamp.seconds * 1000).toLocaleString() : "-";
        historyTableBody.innerHTML += `
          <tr class="bg-zinc-900 hover:bg-zinc-800">
            <td class="p-2 border border-zinc-700">${txn.type || "-"}</td>
            <td class="p-2 border border-zinc-700">${txn.amount || 0}</td>
            <td class="p-2 border border-zinc-700">${txn.method || "-"}</td>
            <td class="p-2 border border-zinc-700">${txn.status || "-"}</td>
            <td class="p-2 border border-zinc-700">${date}</td>
          </tr>
        `;
      });
    } catch (err) {
      console.error("Failed to load transactions:", err);
      historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load transactions.</td></tr>`;
    }
  }
});