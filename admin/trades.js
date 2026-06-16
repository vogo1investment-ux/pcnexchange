import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 🔥 FIREBASE CONFIG (YOUR PROJECT)
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

const tradeList = document.getElementById("tradeList");

// 🔐 ADMIN CHECK
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    tradeList.innerHTML = "Access denied";
    return;
  }

  loadTrades();
});

// 📊 LOAD ALL TRADES
function loadTrades() {
  const ref = collection(db, "trades");

  onSnapshot(ref, (snap) => {
    tradeList.innerHTML = "";

    snap.forEach((t) => {
      const d = t.data();

      const div = document.createElement("div");

      div.style = `
        background:#111827;
        padding:12px;
        border-radius:10px;
        border:1px solid #1f2937;
      `;

      div.innerHTML = `
        <h3 style="color:#22c55e;margin:0;">${d.coin || "COIN"}</h3>

        <p><b>User UID:</b> ${d.userId || ""}</p>
        <p><b>Amount Requested:</b> ${d.amount || 0}</p>
        <p><b>Status:</b> ${d.status || "pending"}</p>

        <label>Approve / Reject</label>
        <select id="status-${t.id}" style="
          width:100%;
          padding:8px;
          margin-top:5px;
          background:#0f172a;
          color:white;
          border:1px solid #334155;
          border-radius:6px;
        ">
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <label>Assign Coin Balance (if approved)</label>
        <input id="balance-${t.id}" value="0.00000001" style="
          width:100%;
          padding:8px;
          margin-top:5px;
          background:#0f172a;
          color:white;
          border:1px solid #334155;
          border-radius:6px;
        ">

        <button style="
          width:100%;
          margin-top:10px;
          padding:10px;
          background:#22c55e;
          border:none;
          color:white;
          font-weight:bold;
          border-radius:6px;
        " onclick="updateTrade('${t.id}','${d.userId}')">
          SAVE
        </button>
      `;

      tradeList.appendChild(div);
    });
  });
}

// 💾 UPDATE TRADE
window.updateTrade = async (tradeId, userId) => {
  const status = document.getElementById(`status-${tradeId}`).value;
  const balance = document.getElementById(`balance-${tradeId}`).value;

  const tradeRef = doc(db, "trades", tradeId);

  await updateDoc(tradeRef, {
    status: status,
    assignedCoin: Number(balance)
  });

  alert("Trade updated successfully");
};