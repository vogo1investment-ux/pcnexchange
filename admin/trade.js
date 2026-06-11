import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const loadHistoryBtn = document.getElementById("loadHistoryBtn");
  const userIdInput = document.getElementById("userIdInput");
  const historyTableBody = document.getElementById("historyTableBody");

  const addTxnBtn = document.getElementById("addTxnBtn");
  const typeInput = document.getElementById("typeInput");
  const amountInput = document.getElementById("amountInput");
  const methodInput = document.getElementById("methodInput");
  const statusInput = document.getElementById("statusInput");
  const timestampInput = document.getElementById("timestampInput");

  const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

  onAuthStateChanged(auth, user => {
    if (!user || user.uid !== ADMIN_UID) {
      alert("Access Denied: Admin Only");
      window.location.href = "admin-login.html";
      return;
    }
  });

  // Load Transactions
  async function loadTransactions() {
    const userId = userIdInput.value.trim();
    if (!userId) return alert("Enter user UID");

    historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Loading...</td></tr>`;

    try {
      const txnCol = collection(db, "users", userId, "transactions");
      const txnSnap = await getDocs(query(txnCol, orderBy("timestamp", "desc")));

      if (txnSnap.empty) {
        historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center">No transactions found.</td></tr>`;
        return;
      }

      historyTableBody.innerHTML = "";
      txnSnap.forEach(docSnap => {
        const txn = docSnap.data();
        const txnId = docSnap.id;
        let date;
        if (txn.timestamp?.toDate) date = txn.timestamp.toDate();
        else if (txn.timestamp && typeof txn.timestamp === "number") date = new Date(txn.timestamp);
        else date = new Date();

        historyTableBody.innerHTML += `
          <tr data-id="${txnId}" class="bg-zinc-900 hover:bg-zinc-800">
            <td class="p-2 border border-zinc-700">${txn.type || "-"}</td>
            <td class="p-2 border border-zinc-700">${txn.amount || 0}</td>
            <td class="p-2 border border-zinc-700">${txn.method || "-"}</td>
            <td class="p-2 border border-zinc-700">${txn.status || "-"}</td>
            <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
            <td class="p-2 border border-zinc-700">
              <button class="editBtn bg-blue-500 text-black px-2 py-1 rounded">Edit</button>
              <button class="deleteBtn bg-red-500 text-black px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
        `;
      });

      // Attach edit/delete listeners
      document.querySelectorAll(".editBtn").forEach(btn => {
        btn.onclick = async e => {
          const row = e.target.closest("tr");
          const txnId = row.dataset.id;
          const type = prompt("Type", row.cells[0].innerText);
          const amount = parseFloat(prompt("Amount", row.cells[1].innerText));
          const method = prompt("Method", row.cells[2].innerText);
          const status = prompt("Status", row.cells[3].innerText);
          const timestamp = new Date(prompt("DateTime (YYYY-MM-DD HH:MM)", row.cells[4].innerText));

          if (!type || !amount || !method || !status || !timestamp) return alert("All fields required");
          await updateDoc(doc(db, "users", userId, "transactions", txnId), { type, amount, method, status, timestamp });
          loadTransactions();
        };
      });

      document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.onclick = async e => {
          const row = e.target.closest("tr");
          const txnId = row.dataset.id;
          if (!confirm("Delete this transaction?")) return;
          await deleteDoc(doc(db, "users", userId, "transactions", txnId));
          loadTransactions();
        };
      });

    } catch (err) {
      console.error(err);
      historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Failed to load transactions. Check console.</td></tr>`;
    }
  }

  loadHistoryBtn.addEventListener("click", loadTransactions);

  // Add Transaction
  addTxnBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    if (!userId) return alert("Enter user UID");

    const type = typeInput.value;
    const amount = parseFloat(amountInput.value);
    const method = methodInput.value.trim();
    const status = statusInput.value;
    const timestamp = timestampInput.value ? new Date(timestampInput.value) : new Date();

    if (!type || !amount || !method) return alert("Enter type, amount, method");

    try {
      await addDoc(collection(db, "users", userId, "transactions"), { type, amount, method, status, timestamp });
      typeInput.value = "Deposit";
      amountInput.value = "";
      methodInput.value = "";
      statusInput.value = "Approved";
      timestampInput.value = "";
      loadTransactions();
    } catch (err) {
      console.error(err);
      alert("Failed to add transaction.");
    }
  });

});