// withdrawals.js
import { db } from "./admin-dashboard-full.js";
import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function init() {
  const section = document.getElementById("section-content");
  section.innerHTML = `
    <h2 class="font-bold text-lg mb-2">Submit Withdrawal</h2>
    <input type="number" id="withdrawAmount" placeholder="Amount" class="p-2 rounded mb-2">
    <button id="submitWithdrawal" class="bg-emerald-500 p-2 rounded font-bold">Submit Withdrawal</button>
    <hr class="my-4">
    <h2 class="font-bold text-lg mb-2">Pending Withdrawals</h2>
    <div id="pendingWithdrawals"></div>
  `;

  document.getElementById("submitWithdrawal").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("withdrawAmount").value);
    if (!amount || amount <= 0) return alert("Enter a valid amount");
    try {
      await addDoc(collection(db, "pendingTransactions"), {
        amount,
        type: "withdrawal",
        status: "Pending",
        createdAt: Date.now()
      });
      alert("Withdrawal submitted successfully");
      loadPendingWithdrawals();
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert(`Withdrawal failed: ${err.message}`);
    }
  });

  async function loadPendingWithdrawals() {
    const snap = await getDocs(collection(db, "pendingTransactions"));
    let html = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (d.type === "withdrawal") {
        html += `<div class="p-2 bg-zinc-700 rounded mb-1">
          <span>$${d.amount} - ${d.status}</span>
          <button onclick="approveWithdrawal('${docSnap.id}')" class="bg-green-500 p-1 rounded ml-2">Approve</button>
          <button onclick="rejectWithdrawal('${docSnap.id}')" class="bg-red-500 p-1 rounded ml-2">Reject</button>
        </div>`;
      }
    });
    document.getElementById("pendingWithdrawals").innerHTML = html;
  }

  window.approveWithdrawal = async (id) => {
    const txnRef = doc(db, "pendingTransactions", id);
    await updateDoc(txnRef, { status: "Approved" });
    loadPendingWithdrawals();
  }

  window.rejectWithdrawal = async (id) => {
    const txnRef = doc(db, "pendingTransactions", id);
    await updateDoc(txnRef, { status: "Rejected" });
    loadPendingWithdrawals();
  }

  loadPendingWithdrawals();
}