import { getFirestore, collection, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();

// Real-time listener for admin stake overview
const stakeListDiv = document.getElementById("adminStakeList");

onSnapshot(collection(db, "stakes"), (snapshot) => {
  stakeListDiv.innerHTML = "";

  snapshot.docs
    .sort((a, b) => b.data().createdAt?.seconds - a.data().createdAt?.seconds)
    .forEach(docSnap => {
      const stake = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-2 border border-zinc-700 rounded flex justify-between items-center";

      div.innerHTML = `
        <div>
          <strong>${stake.coin}</strong> - Amount: <span class="stakeAmount" data-id="${docSnap.id}">${stake.stakedAmount}</span> 
          - Status: <span class="stakeStatus">${stake.status}</span> 
          - User: ${stake.userId} 
          - Date: ${stake.date} ${stake.time}
        </div>
        <div class="flex space-x-2">
          <button class="editBalanceBtn bg-yellow-400 text-black font-bold p-1 rounded">Edit</button>
          <button class="endStakeBtn bg-red-500 text-black font-bold p-1 rounded">End</button>
        </div>
      `;

      stakeListDiv.appendChild(div);

      // Edit stake balance (admin only)
      div.querySelector(".editBalanceBtn").addEventListener("click", async () => {
        const newAmount = prompt("Enter new stake balance:", stake.stakedAmount);
        if (!newAmount) return;
        await updateDoc(doc(db, "stakes", docSnap.id), { stakedAmount: parseFloat(newAmount) });
      });

      // End stake (admin only)
      div.querySelector(".endStakeBtn").addEventListener("click", async () => {
        const confirmEnd = confirm("Are you sure you want to end this stake?");
        if (!confirmEnd) return;
        await updateDoc(doc(db, "stakes", docSnap.id), { status: "Ended" });
      });
    });
});