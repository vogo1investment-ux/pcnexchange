import { getFirestore, collection, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "admin-login.html";
  } else {
    loadWalletRequests();
  }
});

function loadWalletRequests() {
  const listDiv = document.getElementById("walletRequestsList");
  const q = query(collection(db, "pendingTransactions"), orderBy("createdAt", "desc"));

  onSnapshot(q, snapshot => {
    listDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === "wallet") { // Only show wallet requests
        const div = document.createElement("div");
        div.className = "p-2 border border-green-500 rounded bg-black text-white";
        div.innerHTML = `
          <p><strong>User:</strong> ${data.userId}</p>
          <p><strong>Amount:</strong> ${data.amount}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Method/Account:</strong> ${data.recipient || "-"}</p>
          <button class="approveBtn bg-emerald-500 p-1 rounded mt-1">Approve</button>
          <button class="rejectBtn bg-red-500 p-1 rounded mt-1 ml-1">Reject</button>
        `;
        listDiv.appendChild(div);

        div.querySelector(".approveBtn").addEventListener("click", async () => {
          await doc.ref.update({ status: "Approved" });
        });
        div.querySelector(".rejectBtn").addEventListener("click", async () => {
          await doc.ref.update({ status: "Rejected" });
        });
      }
    });
  });
}