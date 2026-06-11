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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const userIdInput = document.getElementById("userIdInput");
const loadHistoryBtn = document.getElementById("loadHistoryBtn");
const historyTableBody = document.getElementById("historyTableBody");

// --- Admin Auth Check ---
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
});

// --- Load History Button ---
loadHistoryBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) {
    alert("Please enter a valid UID");
    return;
  }

  historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>`;

  try {
    const txnCol = collection(db, "users", userId, "transactions");
    const txnQuery = query(txnCol, orderBy("timestamp", "desc"));
    const txnSnapshot = await getDocs(txnQuery);

    if (txnSnapshot.empty) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No transactions found for this user.</td></tr>`;
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
    console.error("Failed to load history:", err);
    historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load history. Check console.</td></tr>`;
  }
});