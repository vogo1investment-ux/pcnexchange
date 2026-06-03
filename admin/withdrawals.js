import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

async function loadWithdrawals() {
  const snap = await getDocs(collection(db, "pendingTransactions"));
  let html = "";
  snap.forEach(docSnap => {
    const txn = docSnap.data();
    if (txn.type === "withdrawal") {
      html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
        <p><strong>${txn.userId}</strong> wants to withdraw $${txn.amount}</p>
        <button onclick="approveWithdrawal('${docSnap.id}','Approved')" class="bg-emerald-400 p-1 rounded mr-1">Approve</button>
        <button onclick="approveWithdrawal('${docSnap.id}','Rejected')" class="bg-red-500 p-1 rounded">Reject</button>
      </div>`;
    }
  });
  document.getElementById("withdrawals-list").innerHTML = html;
}

window.approveWithdrawal = async (id, status) => {
  await updateDoc(doc(db, "pendingTransactions", id), { status });
  loadWithdrawals();
};

loadWithdrawals();