import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ---------------- YOUR FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.appspot.com",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// ---------------- INIT ----------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tradeList = document.getElementById("tradeList");

// ---------------- LOAD ALL TRADE REQUESTS ----------------
// IMPORTANT: this fixes your "only 1 user shows" issue
const q = query(collection(db, "pendingTrades"));

onSnapshot(q, (snapshot) => {

  tradeList.innerHTML = "";

  if (snapshot.empty) {
    tradeList.innerHTML = "<p>No trade requests found</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tradeId = docSnap.id;

    tradeList.innerHTML += `
      <div style="border:1px solid #333; padding:10px; margin:10px;">
        
        <h3>${data.coin || "COIN"}</h3>

        <p><b>User UID:</b> ${data.userId}</p>
        <p><b>Email:</b> ${data.email || "N/A"}</p>
        <p><b>Amount Requested:</b> ${data.amount}</p>
        <p><b>Status:</b> ${data.status}</p>

        <label>Approve / Reject:</label>
        <select id="status-${tradeId}">
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <br><br>

        <label>Assign Coin Balance:</label>
        <input id="coin-${tradeId}" value="0.00000001" />

        <br><br>

        <button onclick="saveTrade('${tradeId}')">
          SAVE
        </button>

      </div>
    `;
  });
});


// ---------------- SAVE UPDATE ----------------
window.saveTrade = async function(tradeId) {

  const status = document.getElementById(`status-${tradeId}`).value;
  const coinAmount = document.getElementById(`coin-${tradeId}`).value;

  const tradeRef = doc(db, "pendingTrades", tradeId);

  await updateDoc(tradeRef, {
    status: status,
    assignedCoin: parseFloat(coinAmount)
  });

  alert("Updated successfully!");
};