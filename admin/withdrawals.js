// withdrawals.js
import { getFirestore, collection, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const withdrawListDiv = document.getElementById("withdrawList");

// Listen in real-time to all pendingTransactions
onSnapshot(collection(db, "pendingTransactions"), (snapshot) => {
  withdrawListDiv.innerHTML = "";

  // Filter only withdrawals
  snapshot.docs
    .filter(docSnap => docSnap.data().type === "withdrawal")
    .forEach(docSnap => {
      const withdrawal = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-2 border border-zinc-700 rounded flex justify-between items-center mb-2";

      div.innerHTML = `
        <div>
          <strong>User:</strong> ${withdrawal.userId} <br>
          <strong>Amount:</strong> ${withdrawal.amount} <br>
          <strong>Method:</strong> ${withdrawal.method || "-"} <br>
          <strong>Status:</strong> <span class="status">${withdrawal.status || "Pending"}</span>
        </div>
        <div class="flex space-x-2">
          <button class="approveBtn bg-green-500 text-black p-1 rounded">Approve</button>
          <button class="rejectBtn bg-red-500 text-black p-1 rounded">Reject</button>
        </div>
      `;

      withdrawListDiv.appendChild(div);

      // Approve button
      div.querySelector(".approveBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });
      });

      // Reject button
      div.querySelector(".rejectBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
      });
    });
});