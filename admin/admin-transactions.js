// admin-transactions.js
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const tableBody = document.getElementById("transactionsTable");

async function loadTransactions() {
  tableBody.innerHTML = `<tr><td colspan="5" class="p-2 text-center">Loading...</td></tr>`;

  try {
    const snap = await getDocs(collection(db, "pendingTransactions"));

    if (snap.empty) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-2 text-center">No pending transactions</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.className = "bg-zinc-800 border-b border-zinc-700";
      tr.innerHTML = `
        <td class="p-2">${data.userId}</td>
        <td class="p-2">${data.type}</td>
        <td class="p-2">${data.amount}</td>
        <td class="p-2">${data.status}</td>
        <td class="p-2">
          ${data.status === "Pending" ? `<button class="approveBtn p-1 bg-emerald-500 rounded" data-id="${docSnap.id}">Approve</button>` : ""}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Approve button functionality
    document.querySelectorAll(".approveBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const txnId = btn.dataset.id;
        const txnRef = doc(db, "pendingTransactions", txnId);

        await updateDoc(txnRef, { status: "Approved" });

        // Reload table
        loadTransactions();
      });
    });

  } catch (err) {
    console.error("Error loading transactions:", err);
    tableBody.innerHTML = `<tr><td colspan="5" class="p-2 text-center text-red-500">Failed to load transactions</td></tr>`;
  }
}

loadTransactions();