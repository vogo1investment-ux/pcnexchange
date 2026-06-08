import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const container = document.getElementById("walletRequestsContainer");

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadWalletRequests();
});

// Load wallet requests in real-time
function loadWalletRequests() {
  const q = query(collection(db, "pendingTransactions"), where("type", "==", "generateWallet"));
  
  onSnapshot(q, snapshot => {
    container.innerHTML = "";
    if (snapshot.empty) {
      container.innerHTML = "<div>No wallet requests found.</div>";
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "p-4 border border-green-500 rounded bg-zinc-900 flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-2 md:space-y-0";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>User ID:</strong> ${data.userId}<br>
        <strong>Coin:</strong> ${data.coin}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Created At:</strong> ${data.createdAt?.toDate().toLocaleString() || "N/A"}<br>
        <strong>Admin Reply:</strong> ${data.adminReply || "-"}
      `;

      const buttons = document.createElement("div");
      buttons.className = "flex space-x-2";
      
      const approveBtn = document.createElement("button");
      approveBtn.innerText = "Approve";
      approveBtn.className = "bg-green-500 p-2 rounded font-bold";
      approveBtn.onclick = async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), {
          status: "Approved",
          adminReply: "Approved",
          updatedAt: serverTimestamp()
        });
      };

      const rejectBtn = document.createElement("button");
      rejectBtn.innerText = "Reject";
      rejectBtn.className = "bg-red-500 p-2 rounded font-bold";
      rejectBtn.onclick = async () => {
        await updateDoc(doc(db, "pendingTransactions", docSnap.id), {
          status: "Rejected",
          adminReply: "Rejected",
          updatedAt: serverTimestamp()
        });
      };

      buttons.appendChild(approveBtn);
      buttons.appendChild(rejectBtn);

      div.appendChild(info);
      div.appendChild(buttons);
      container.appendChild(div);
    });
  });
}