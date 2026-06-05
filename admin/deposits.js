import { getFirestore, collection, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const depositListDiv = document.getElementById("depositList");

onSnapshot(collection(db, "pendingTransactions"), (snapshot) => {
  depositListDiv.innerHTML = "";
  
  snapshot.docs
    .filter(docSnap => docSnap.data().type === "deposit")
    .sort((a,b)=> b.data().createdAt?.seconds - a.data().createdAt?.seconds)
    .forEach(docSnap => {
      const deposit = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-2 border border-zinc-700 rounded flex justify-between items-center";

      div.innerHTML = `
        <div>
          <strong>User:</strong> ${deposit.userId} - 
          <strong>Amount:</strong> <span class="amount" data-id="${docSnap.id}">${deposit.amount}</span> - 
          <strong>Status:</strong> <span class="status">${deposit.status}</span>
        </div>
        <div class="flex space-x-2">
          <button class="editBtn bg-yellow-400 text-black font-bold p-1 rounded">Edit</button>
          <button class="approveBtn bg-green-500 text-black font-bold p-1 rounded">Approve</button>
          <button class="rejectBtn bg-red-500 text-black font-bold p-1 rounded">Reject</button>
        </div>
      `;

      depositListDiv.appendChild(div);

      div.querySelector(".editBtn").addEventListener("click", async () => {
        const newAmount = prompt("Enter new deposit amount:", deposit.amount);
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