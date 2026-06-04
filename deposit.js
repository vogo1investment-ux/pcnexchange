import { db } from "./admin-dashboard-full.js";
import { collection, addDoc, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function init() {
  const section = document.getElementById("section-content");
  section.innerHTML = `
    <h2 class="font-bold text-lg mb-2">Pending Deposits</h2>
    <div id="pendingDeposits"></div>
  `;

  async function loadPendingDeposits() {
    const snap = await getDocs(collection(db, "pendingTransactions"));
    let html = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (d.type === "deposit" && d.status === "Pending") {
        html += `<div class="p-2 bg-zinc-700 rounded mb-1">
          <span>User: ${d.userId} - $${d.amount}</span>
          <button onclick="approveDeposit('${docSnap.id}','${d.userId}',${d.amount})" class="bg-green-500 p-1 rounded ml-2">Approve</button>
          <button onclick="rejectDeposit('${docSnap.id}')" class="bg-red-500 p-1 rounded ml-2">Reject</button>
        </div>`;
      }
    });
    document.getElementById("pendingDeposits").innerHTML = html;
  }

  window.approveDeposit = async (txnId, userId, amount) => {
    try {
      // Update the transaction status
      await updateDoc(doc(db, "pendingTransactions", txnId), { status: "Approved" });

      // Update user's available balance
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newBalance = (userData.availableBalance || 0) + amount;
        await updateDoc(userRef, { availableBalance: newBalance });
      }

      loadPendingDeposits();
      alert("Deposit approved and balance updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to approve deposit: " + err.message);
    }
  };

  window.rejectDeposit = async (txnId) => {
    await updateDoc(doc(db, "pendingTransactions", txnId), { status: "Rejected" });
    loadPendingDeposits();
  };

  loadPendingDeposits();
}