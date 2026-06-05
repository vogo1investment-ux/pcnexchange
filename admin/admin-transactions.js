import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const transactionsList = document.getElementById("transactionsList");

// Admin auth check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadPendingTransactions();
});

// Load pending deposits & withdrawals
function loadPendingTransactions() {
  const txnRef = collection(db, "pendingTransactions");
  onSnapshot(txnRef, snapshot => {
    transactionsList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const tx = docSnap.data();
      const card = document.createElement("div");
      card.className = "p-4 bg-zinc-900 border border-zinc-700 rounded-xl flex justify-between items-center";
      card.innerHTML = `
        <div>
          <p><strong>Type:</strong> ${tx.type}</p>
          <p><strong>User ID:</strong> ${tx.userId}</p>
          <p><strong>Amount:</strong> $${tx.amount}</p>
          <p><strong>Method:</strong> ${tx.method}</p>
          <p><strong>Recipient:</strong> ${tx.recipient}</p>
          <p><strong>Status:</strong> <span id="status-${docSnap.id}">${tx.status}</span></p>
        </div>
        <div class="space-y-2">
          <button class="bg-green-500 text-black p-2 rounded" id="approve-${docSnap.id}">Approve</button>
          <button class="bg-red-500 text-black p-2 rounded" id="reject-${docSnap.id}">Reject</button>
        </div>
      `;
      transactionsList.appendChild(card);

      // Approve button
      document.getElementById(`approve-${docSnap.id}`).onclick = async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });
        document.getElementById(`status-${docSnap.id}`).innerText = "Approved";
      };

      // Reject button
      document.getElementById(`reject-${docSnap.id}`).onclick = async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
        document.getElementById(`status-${docSnap.id}`).innerText = "Rejected";
      };
    });

    if (snapshot.empty) {
      transactionsList.innerHTML = `<p class="text-red-500">No pending transactions found.</p>`;
    }
  });
}