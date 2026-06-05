import { getFirestore, collection, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const withdrawListDiv = document.getElementById("withdrawList");

onSnapshot(collection(db, "pendingTransactions"), (snapshot) => {
  withdrawListDiv.innerHTML = "";

  snapshot.docs
    .filter(docSnap => docSnap.data().type === "withdrawal")
    .forEach(docSnap => {
      const withdraw = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-2 border border-zinc-700 rounded flex justify-between items-center";

      div.innerHTML = `
        <div>
          <strong>User:</strong> ${withdraw.userId} -
          <strong>Amount:</strong> <span>${withdraw.amount}</span> -
          <strong>Status:</strong> <span class="status">${withdraw.status || "Pending"}</span>
        </div>
        <div class="flex space-x-2">
          <button class="approveBtn bg-green-500 text-black font-bold p-1 rounded">Approve</button>
          <button class="rejectBtn bg-red-500 text-black font-bold p-1 rounded">Reject</button>
        </div>
      `;
      withdrawListDiv.appendChild(div);

      div.querySelector(".approveBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });
      });

      div.querySelector(".rejectBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
      });
    });
});