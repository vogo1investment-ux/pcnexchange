import { getFirestore, collection, onSnapshot, doc, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const historyList = document.getElementById("historyList");

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadWithdrawals();
});

function loadWithdrawals() {
  const pendingRef = collection(db, "pendingTransactions");
  // Only withdrawals
  const q = query(pendingRef, where("type", "==", "withdraw"), orderBy("timestamp", "desc"));

  onSnapshot(q, snapshot => {
    historyList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const tx = { id: docSnap.id, ...docSnap.data() };
      const card = document.createElement("div");
      card.className = "history-card";

      const statusColor = tx.status === "pending" ? "#FFA500" : tx.status === "Approved" ? "#00ff66" : "#ff4444";

      card.innerHTML = `
        <div class="history-info">
          <strong>WITHDRAWAL</strong>
          <small>${tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : new Date(tx.timestamp || Date.now()).toLocaleString()}</small>
          <p>Amount: $${tx.amount}</p>
          <p>Method: ${tx.method || "N/A"}</p>
          <p>Region: ${tx.region || "N/A"}</p>
          <p>Status: <span style="color:${statusColor}">${tx.status || "pending"}</span></p>
        </div>
        <div class="history-amount">
          <button class="history-btn approve" data-id="${tx.id}">Approve</button>
          <button class="history-btn reject" data-id="${tx.id}">Reject</button>
        </div>
      `;
      historyList.appendChild(card);
    });

    // Approve/Reject handlers
    document.querySelectorAll(".history-btn.approve").forEach(btn => {
      btn.addEventListener("click", async () => {
        const txId = btn.dataset.id;
        await updateDoc(doc(db, "pendingTransactions", txId), { status: "Approved" });
      });
    });

    document.querySelectorAll(".history-btn.reject").forEach(btn => {
      btn.addEventListener("click", async () => {
        const txId = btn.dataset.id;
        await updateDoc(doc(db, "pendingTransactions", txId), { status: "Rejected" });
      });
    });
  });
}