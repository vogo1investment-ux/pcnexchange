import { getFirestore, collection, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const withdrawListDiv = document.getElementById("withdrawList");

onSnapshot(collection(db, "pendingTransactions"), (snapshot) => {
  withdrawListDiv.innerHTML = "";

  snapshot.docs
    .filter(docSnap => docSnap.data().type === "withdrawal")
    .sort((a,b)=> b.data().createdAt?.seconds - a.data().createdAt?.seconds)
    .forEach(docSnap => {
      const withdraw = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-2 border border-zinc-700 rounded flex justify-between items-center";

      div.innerHTML = `
        <div>
          <strong>User:</strong> ${withdraw.userId} - 
          <strong>Amount:</strong> <span class="amount" data-id="${docSnap.id}">${withdraw.amount}</span> - 
          <strong>Status:</strong> <span class="status">${withdraw.status}</span>
        </div>
        <div class="flex space-x-2">
          <button class="editBtn bg-yellow-400 text-black font-bold p-1 rounded">Edit</button>
          <button class="approveBtn bg-green-500 text-black font-bold p-1 rounded">Approve</button>
          <button class="rejectBtn bg-red-500 text-black font-bold p-1 rounded">Reject</button>
        </div>
      `;

      withdrawListDiv.appendChild(div);

      div.querySelector(".editBtn").addEventListener("click", async () => {
        const newAmount = prompt("Enter new withdrawal amount:", withdraw.amount);
        if (!newAmount) return;
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { amount: parseFloat(newAmount) });
      });

      div.querySelector(".approveBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });
      });

      div.querySelector(".rejectBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
      });
    });
});