import { db } from "./admin-dashboard-full.js";
import { collection, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function init() {
  const section = document.getElementById("section-content");
  section.innerHTML = `
    <h2 class="text-2xl font-bold mb-4 text-emerald-400">Wallet Requests</h2>
    <div id="walletRequests" class="max-h-[400px] overflow-y-auto"></div>
  `;

  const walletRequestsDiv = document.getElementById("walletRequests");

  // Listen to pending wallet requests in real time
  const q = query(
    collection(db, "pendingTransactions"),
    where("type", "==", "generateWallet"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    let html = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      html += `
        <div class="p-2 bg-zinc-800 rounded mb-2">
          <span>User: ${d.userId}</span><br>
          <span>Coin: ${d.coin}</span><br>
          <span>Status: ${d.status}</span><br>
          <input type="text" id="reply-${docSnap.id}" placeholder="Enter wallet address" class="p-2 rounded w-full mt-1 mb-2 bg-black border border-zinc-700">
          <button onclick="sendReply('${docSnap.id}')" class="bg-emerald-500 text-black p-2 rounded font-bold w-full mb-2">Send Wallet Address</button>
        </div>
      `;
    });
    walletRequestsDiv.innerHTML = html;
  });

  // Function to send wallet reply
  window.sendReply = async (txnId) => {
    const walletAddress = document.getElementById(`reply-${txnId}`).value.trim();
    if (!walletAddress) return alert("Enter wallet address");

    try {
      const txnRef = doc(db, "pendingTransactions", txnId);
      await updateDoc(txnRef, {
        adminReply: walletAddress,
        status: "Approved"
      });
      alert("Wallet address sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send wallet address: " + err.message);
    }
  };
}