import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const transactionList = document.getElementById("transactionList");

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadTransactions();
});

// Load all pending deposits & withdrawals with real-time updates
function loadTransactions() {
  const txnQuery = collection(db, "pendingTransactions");

  onSnapshot(txnQuery, querySnapshot => {
    transactionList.innerHTML = "";

    if (querySnapshot.empty) {
      transactionList.innerHTML = `<p class="text-zinc-400">No pending transactions.</p>`;
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col md:flex-row justify-between items-start md:items-center";

      const statusColor = data.status === "Approved" ? "#00ff66" :
                          data.status === "Rejected" ? "#ff4444" : "#FFA500";

      card.innerHTML = `
        <div class="flex-1">
          <p><strong>User ID:</strong> ${data.userId}</p>
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Method:</strong> ${data.method || "N/A"}</p>
          <p><strong>Region:</strong> ${data.region || "N/A"}</p>
          <p><strong>Status:</strong> <span id="status-${docSnap.id}" style="color:${statusColor}">${data.status || "Pending"}</span></p>
        </div>
        <div class="mt-2 md:mt-0 flex gap-2">
          <button class="approve-btn bg-green-500 p-2 rounded font-bold" data-id="${docSnap.id}" data-user="${data.userId}">Approve</button>
          <button class="reject-btn bg-red-500 p-2 rounded font-bold" data-id="${docSnap.id}" data-user="${data.userId}">Reject</button>
        </div>
      `;
      transactionList.appendChild(card);
    });

    attachActionButtons();
  });
}

// Attach approve/reject buttons
function attachActionButtons() {
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.onclick = async () => {
      const txnId = btn.dataset.id;
      const userId = btn.dataset.user;

      // Update transaction status in pendingTransactions
      await updateDoc(doc(db, "pendingTransactions", txnId), { status: "Approved" });

      // Update user history in subcollection
      const userTxnRef = doc(db, "users", userId, "transactions", txnId);
      await updateDoc(userTxnRef, { status: "Approved" });

      const statusSpan = document.getElementById(`status-${txnId}`);
      statusSpan.innerText = "Approved";
      statusSpan.style.color = "#00ff66";
    };
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.onclick = async () => {
      const txnId = btn.dataset.id;
      const userId = btn.dataset.user;

      await updateDoc(doc(db, "pendingTransactions", txnId), { status: "Rejected" });
      const userTxnRef = doc(db, "users", userId, "transactions", txnId);
      await updateDoc(userTxnRef, { status: "Rejected" });

      const statusSpan = document.getElementById(`status-${txnId}`);
      statusSpan.innerText = "Rejected";
      statusSpan.style.color = "#ff4444";
    };
  });
}