import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const withdrawList = document.getElementById("withdrawList");

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadWithdrawals();
});

// Load pending withdrawals
function loadWithdrawals() {
  const q = query(collection(db, "pendingTransactions"), where("type", "==", "withdraw"));
  onSnapshot(q, snapshot => {
    withdrawList.innerHTML = "";

    if (snapshot.empty) {
      withdrawList.innerHTML = `<p class="text-zinc-400">No pending withdrawals.</p>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col md:flex-row justify-between items-start md:items-center";

      card.innerHTML = `
        <div class="flex-1">
          <p><strong>User ID:</strong> ${data.userId}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Method:</strong> ${data.method}</p>
          <p><strong>Region:</strong> ${data.region}</p>
          <p><strong>Status:</strong> <span id="status-${docSnap.id}">${data.status || "Pending"}</span></p>
        </div>
        <div class="mt-2 md:mt-0 flex gap-2">
          <button class="approve-btn bg-green-500 p-2 rounded font-bold" data-id="${docSnap.id}">Approve</button>
          <button class="reject-btn bg-red-500 p-2 rounded font-bold" data-id="${docSnap.id}">Reject</button>
        </div>
      `;

      withdrawList.appendChild(card);
    });

    // Attach button events
    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        await updateDoc(doc(db, "pendingTransactions", id), { status: "Approved" });
        document.getElementById(`status-${id}`).innerText = "Approved";
      };
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        await updateDoc(doc(db, "pendingTransactions", id), { status: "Rejected" });
        document.getElementById(`status-${id}`).innerText = "Rejected";
      };
    });

  });
}