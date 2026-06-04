// deposits.js
import { db } from "./admin-dashboard-full.js";
import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function init() {
  const section = document.getElementById("section-content");
  section.innerHTML = `
    <h2 class="font-bold text-lg mb-2">Submit Deposit</h2>
    <input type="number" id="depositAmount" placeholder="Amount" class="p-2 rounded mb-2">
    <button id="submitDeposit" class="bg-emerald-500 p-2 rounded font-bold">Submit Deposit</button>
    <hr class="my-4">
    <h2 class="font-bold text-lg mb-2">Pending Deposits</h2>
    <div id="pendingDeposits"></div>
  `;

  document.getElementById("submitDeposit").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("depositAmount").value);
    if (!amount || amount <= 0) return alert("Enter a valid amount");
    try {
      await addDoc(collection(db, "pendingTransactions"), {
        amount,
        type: "deposit",
        status: "Pending",
        createdAt: Date.now()
      });
      alert("Deposit submitted successfully");
      loadPendingDeposits();
    } catch (err) {
      console.error("Deposit failed:", err);
      alert(`Deposit failed: ${err.message}`);
    }
  });

  async function loadPendingDeposits() {
    const snap = await getDocs(collection(db, "pendingTransactions"));
    let html = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (d.type === "deposit") {
        html += `<div class="p-2 bg-zinc-700 rounded mb-1">
          <span>$${d.amount} - ${d.status}</span>
          <button onclick="approveDeposit('${docSnap.id}')" class="bg-green-500 p-1 rounded ml-2">Approve</button>
          <button onclick="rejectDeposit('${docSnap.id}')" class="bg-red-500 p-1 rounded ml-2">Reject</button>
        </div>`;
      }
    });
    document.getElementById("pendingDeposits").innerHTML = html;
  }

  window.approveDeposit = async (id) => {
    const txnRef = doc(db, "pendingTransactions", id);
    await updateDoc(txnRef, { status: "Approved" });
    loadPendingDeposits();
  }

  window.rejectDeposit = async (id) => {
    const txnRef = doc(db, "pendingTransactions", id);
    await updateDoc(txnRef, { status: "Rejected" });
    loadPendingDeposits();
  }

  loadPendingDeposits();
}