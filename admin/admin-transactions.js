import { getFirestore, collection, onSnapshot, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const transactionsTable = document.getElementById("transactionsTable");

async function renderTransactions() {
  const pendingRef = collection(db, "pendingTransactions");

  onSnapshot(pendingRef, snapshot => {
    transactionsTable.innerHTML = "";

    if (snapshot.empty) {
      transactionsTable.innerHTML = `<tr><td colspan="5" class="p-2 text-center">No pending transactions</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const tx = docSnap.data();
      const row = document.createElement("tr");
      row.className = "border-b border-zinc-700";

      row.innerHTML = `
        <td class="p-2">${tx.userId}</td>
        <td class="p-2">${tx.type}</td>
        <td class="p-2">$${tx.amount}</td>
        <td class="p-2">${tx.status}</td>
        <td class="p-2 space-x-2">
          ${tx.status === "Pending" ? `
            <button class="approveBtn bg-green-600 p-1 rounded text-black">Approve</button>
            <button class="rejectBtn bg-red-600 p-1 rounded text-black">Reject</button>
          ` : '-'}
        </td>
      `;

      transactionsTable.appendChild(row);

      // Approve handler
      row.querySelector(".approveBtn")?.addEventListener("click", async () => {
        try {
          const userRef = doc(db, "users", tx.userId);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) return alert("User not found");

          let newBalance = userSnap.data().availableBalance || 0;

          if (tx.type.toLowerCase() === "deposit") {
            newBalance += tx.amount;
          } else if (tx.type.toLowerCase() === "withdrawal") {
            newBalance -= tx.amount;
          }

          await updateDoc(userRef, { availableBalance: newBalance });
          await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });

        } catch (err) {
          console.error(err);
          alert("Error approving transaction");
        }
      });

      // Reject handler
      row.querySelector(".rejectBtn")?.addEventListener("click", async () => {
        try {
          await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
        } catch (err) {
          console.error(err);
          alert("Error rejecting transaction");
        }
      });
    });
  });
}

renderTransactions();