import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot
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

const list = document.getElementById("airdropList");
const balanceBox = document.getElementById("totalBalance");

let uid;

/* ================= SAFE DATE ================= */
function safeDate(t) {
  if (!t) return "N/A";
  if (typeof t === "number") return new Date(t).toLocaleString();
  if (t?.toDate) return t.toDate().toLocaleString();
  return "N/A";
}

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  uid = user.uid;
  loadAirdrops();
});

/* ================= LOAD AIRDROPS ================= */
function loadAirdrops() {

  onSnapshot(collection(db, "airdropCampaigns"), (snap) => {

    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<p style='color:#aaa'>No airdrops available</p>";
      return;
    }

    snap.forEach((doc) => {
      const d = doc.data();

      const name = d.name || "Unnamed Coin";
      const rate = d.rate || 0;
      const price = d.price || 0;
      const status = d.status || "inactive";

      const start = safeDate(d.startTime);
      const end = safeDate(d.endTime);

      list.innerHTML += `
        <div class="card">
          🚀 <b>${name}</b><br>

          💰 Price: ${price}<br>
          ⚡ Mining Rate: ${rate}<br>

          🟢 Start: ${start}<br>
          🔴 End: ${end}<br>

          📌 Status: ${status}<br><br>

          <button onclick="startMining('${doc.id}', ${rate})"
            style="background:#22c55e;color:black;padding:10px;width:100%;border:none">
            🚀 Start Airdrop
          </button>
        </div>
      `;
    });

  }, (err) => {
    console.log("Airdrop error:", err);
    list.innerHTML = "<p style='color:red'>Failed to load airdrops</p>";
  });
}

/* ================= MINING SYSTEM ================= */
window.startMining = (id, rate) => {

  if (!uid) return alert("Login required");

  let balance = 0;

  setInterval(() => {
    balance += Number(rate || 0);

    balanceBox.innerText = balance.toFixed(6);

  }, 1000);
};