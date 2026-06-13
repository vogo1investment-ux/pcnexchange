import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const list = document.getElementById("list");

// ---------------- ADMIN CHECK ----------------
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied");
    window.location.href = "login.html";
    return;
  }

  loadAllTransactions();
});

// ---------------- LOAD ALL USERS HISTORY ----------------
async function loadAllTransactions() {
  list.innerHTML = "<p>Loading...</p>";

  const usersSnap = await getDocs(collection(db, "users"));

  list.innerHTML = "";

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;

    const txSnap = await getDocs(
      collection(db, "users", uid, "transactions")
    );

    txSnap.forEach(tx => {
      const d = tx.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="small">User ID: ${uid}</div>

        <div><b>Type:</b></div>
        <input id="type_${tx.id}" value="${d.type || ""}" />

        <div><b>Amount:</b></div>
        <input id="amount_${tx.id}" value="${d.amount || ""}" />

        <div><b>Method:</b></div>
        <input id="method_${tx.id}" value="${d.method || ""}" />

        <div><b>Status:</b></div>
        <select id="status_${tx.id}">
          <option ${d.status==="Pending"?"selected":""}>Pending</option>
          <option ${d.status==="Approved"?"selected":""}>Approved</option>
          <option ${d.status==="Rejected"?"selected":""}>Rejected</option>
        </select>

        <button onclick="updateTx('${uid}','${tx.id}')">
          Update Transaction
        </button>
      `;

      list.appendChild(card);
    });
  }
}

// ---------------- UPDATE FUNCTION ----------------
window.updateTx = async (uid, txId) => {
  try {
    const ref = doc(db, "users", uid, "transactions", txId);

    await updateDoc(ref, {
      type: document.getElementById(`type_${txId}`).value,
      amount: Number(document.getElementById(`amount_${txId}`).value),
      method: document.getElementById(`method_${txId}`).value,
      status: document.getElementById(`status_${txId}`).value,
      updatedAt: new Date()
    });

    alert("Updated successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to update transaction");
  }
};