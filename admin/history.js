import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const loadHistoryBtn = document.getElementById("loadHistoryBtn");
const userIdInput = document.getElementById("userIdInput");
const historyTableBody = document.getElementById("historyTableBody");

// --- Optional: Admin auth check (replace with your admin UID if needed) ---
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "admin-login.html";
    return;
  }
});

// --- Load history when button clicked ---
loadHistoryBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) {
    alert("Please enter a user UID.");
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

      // Safe timestamp handling
      let date;
      if (txn.timestamp?.toDate) date = txn.timestamp.toDate();
      else if (txn.timestamp && typeof txn.timestamp === "number") date = new Date(txn.timestamp);
      else date = new Date();

      historyTableBody.innerHTML += `
        <tr class="bg-zinc-900 hover:bg-zinc-800">
          <td class="p-2 border border-zinc-700">${txn.type || "-"}</td>
          <td class="p-2 border border-zinc-700">${txn.amount || 0}</td>
          <td class="p-2 border border-zinc-700">${txn.method || "-"}</td>
          <td class="p-2 border border-zinc-700">${txn.status || "-"}</td>
          <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Failed to load transactions:", err);
    historyTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load transactions. Check console.</td></tr>`;
  }
});