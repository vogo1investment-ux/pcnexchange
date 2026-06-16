import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const tradeBox = document.getElementById("tradeBox");


// 🔥 LOAD ALL TRADES REALTIME
onSnapshot(collection(db, "pendingTrades"), (snap) => {

  tradeBox.innerHTML = "";

  snap.forEach((docSnap) => {

    const d = docSnap.data();
    const id = docSnap.id;

    tradeBox.innerHTML += `
      <div style="
        background:linear-gradient(145deg,#111827,#0f172a);
        border:1px solid #1f2937;
        border-radius:15px;
        padding:15px;
        box-shadow:0 4px 20px rgba(0,0,0,0.3);
      ">

        <!-- TITLE -->
        <h2 style="margin:0;color:#38bdf8;">${d.coin}</h2>

        <p style="margin:5px 0;color:#cbd5e1;"><b>User UID:</b> ${d.userId}</p>
        <p style="margin:5px 0;color:#cbd5e1;"><b>Email:</b> ${d.email}</p>
        <p style="margin:5px 0;color:#facc15;"><b>Requested:</b> ${d.amount}</p>

        <p style="margin:5px 0;color:${d.status === "approved" ? "#22c55e" : d.status === "rejected" ? "#ef4444" : "#f59e0b"};">
          <b>Status:</b> ${d.status}
        </p>

        <!-- STATUS -->
        <label style="font-size:13px;color:#94a3b8;">Approve / Reject</label>
        <select id="status-${id}" style="
          width:100%;
          padding:10px;
          margin-top:5px;
          border-radius:8px;
          background:#0b1220;
          color:white;
          border:1px solid #334155;
        ">
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <!-- COIN AMOUNT -->
        <label style="font-size:13px;color:#94a3b8;margin-top:10px;">
          Assign Coin to User Wallet
        </label>

        <input id="add-${id}" value="0.00000001" style="
          width:100%;
          padding:10px;
          margin-top:5px;
          border-radius:8px;
          background:#0b1220;
          color:white;
          border:1px solid #334155;
        ">

        <!-- BUTTON -->
        <button onclick="approveTrade('${id}','${d.userId}','${d.coin}')" style="
          width:100%;
          margin-top:12px;
          padding:12px;
          background:linear-gradient(90deg,#22c55e,#16a34a);
          border:none;
          border-radius:10px;
          color:white;
          font-weight:bold;
          cursor:pointer;
        ">
          SAVE CHANGES
        </button>

      </div>
    `;
  });
});


// 🔥 APPROVE + ADD COIN TO USER WALLET
window.approveTrade = async (id, userId, coin) => {

  const status = document.getElementById(`status-${id}`).value;
  const amount = parseFloat(document.getElementById(`add-${id}`).value);

  await updateDoc(doc(db, "pendingTrades", id), {
    status: status
  });

  if (status === "approved") {

    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    let userData = snap.exists() ? snap.data() : {};
    let coins = userData.coins || {};

    coins[coin] = (coins[coin] || 0) + amount;

    await setDoc(userRef, {
      ...userData,
      coins: coins
    }, { merge: true });

    alert("✅ Coin successfully added to user wallet!");
  }

  alert("Updated successfully!");
};