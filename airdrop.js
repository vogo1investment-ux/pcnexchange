import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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

const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("list");

let uid;
let balance = 0;
let miningIntervals = {}; // prevent duplicate mining

// format always 8 decimals
function format(num) {
  return Number(num).toFixed(8);
}

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  uid = user.uid;

  // load saved balance
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    balance = snap.data().balance || 0;
  } else {
    await setDoc(ref, { balance: 0 });
  }

  updateBalance();
});

// ---------------- UPDATE BALANCE UI + FIRESTORE ----------------
async function updateBalance() {
  balanceEl.textContent = format(balance);

  if (!uid) return;
  await updateDoc(doc(db, "users", uid), {
    balance: balance
  });
}

// ---------------- LOAD AIRDROPS ----------------
window.loadAirdrops = async function () {
  listEl.innerHTML = "<p>Loading airdrops...</p>";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  if (snap.empty) {
    listEl.innerHTML = "<p>No airdrops found</p>";
    return;
  }

  listEl.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="title">🚀 ${data.name || "Airdrop"}</div>

      <div class="row">
        <div>Start: ${new Date(data.startTime).toLocaleString()}</div>
      </div>

      <div class="row">
        <div>End: ${new Date(data.endTime).toLocaleString()}</div>
      </div>

      <div class="row">
        <div>Rate: ${data.rate || 0.00000001}/tick</div>
      </div>

      <div class="mineRow">
        <button class="mineBtn" id="btn-${d.id}">
          ▶ Start Mining
        </button>
      </div>

      <div class="mineRow">
        <button class="mineBtn" style="background:#ffcc00" onclick="withdraw('${d.id}')">
          💸 Withdraw
        </button>
      </div>
    `;

    listEl.appendChild(card);

    // attach mining
    const btn = card.querySelector(`#btn-${d.id}`);

    btn.onclick = () => startMining(d.id, data.rate || 0.00000001, data.endTime, btn);
  });
};

// ---------------- MINING ENGINE ----------------
function startMining(id, rate, endTime, btn) {
  if (miningIntervals[id]) return;

  const end = Number(endTime);

  btn.innerText = "⛏ Mining...";

  miningIntervals[id] = setInterval(async () => {
    const now = Date.now();

    if (now >= end) {
      clearInterval(miningIntervals[id]);
      btn.innerText = "⛔ Ended";
      return;
    }

    balance += rate;

    updateBalance();
  }, 1000);
}

// ---------------- WITHDRAW (placeholder) ----------------
window.withdraw = function (id) {
  alert("Withdrawal system not yet connected for: " + id);
};