import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config (same as your other admin scripts)
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
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      // Only show wallet requests
      if (data.type === "wallet") {
        const div = document.createElement("div");
        div.className = "request-card";

        div.innerHTML = `
          <p><strong>User ID:</strong> ${data.userId}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Method / Account:</strong> ${data.recipient || "-"}</p>
          <div class="flex gap-2 mt-2">
            <button class="approveBtn">Approve</button>
            <button class="rejectBtn">Reject</button>
          </div>
        `;

        listDiv.appendChild(div);

        // Approve button
        div.querySelector(".approveBtn").addEventListener("click", async () => {
          try {
            await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Approved" });
            div.querySelector("p:nth-child(3)").innerText = "Status: Approved";
          } catch (err) {
            console.error(err);
            alert("Failed to approve request");
          }
        });

        // Reject button
        div.querySelector(".rejectBtn").addEventListener("click", async () => {
          try {
            await updateDoc(doc(db, "pendingTransactions", docSnap.id), { status: "Rejected" });
            div.querySelector("p:nth-child(3)").innerText = "Status: Rejected";
          } catch (err) {
            console.error(err);
            alert("Failed to reject request");
          }
        });
      }
    });

    if (listDiv.innerHTML === "") {
      listDiv.innerHTML = `<p style="color:#0f0; padding:10px;">No wallet requests found.</p>`;
    }
  });
}