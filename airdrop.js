import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ---------------- FIREBASE ----------------
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

// ---------------- UI ----------------
const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");

let uid = null;
let miningIntervals = {};

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;
  loadBalance();
});

// ---------------- BALANCE ----------------
async function loadBalance() {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();
  balanceEl.innerText = (data.airdropBalance || 0).toFixed(6);
}

// ---------------- LOAD AIRDROPS (GLOBAL FOR BUTTON) ----------------
window.loadAirdrops = async function () {
  list.innerHTML = "<p>Loading airdrops...</p>";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      list.innerHTML = "<p>No airdrops available</p>";
      return;
    }

    list.innerHTML = "";

    snap.forEach((docItem) => {
      const d = docItem.data();

      const card = document.createElement("div");
      card.className = "card";

      const startTime = d.startTime?.toDate?.() || new Date(d.startTime);
      const endTime = d.endTime?.toDate?.() || new Date(d.endTime);

      card.innerHTML = `
        <div class="title">🚀 ${d.name}</div>

        <div class="row">
          <div>💰 Price: ${d.price || 0}</div>
          <div>⚡ Rate: ${d.rate || 0}</div>
        </div>

        <div class="row">
          <div>📅 Start: ${startTime.toLocaleString()}</div>
        </div>

        <div class="row">
          <div>⛔ End: ${endTime.toLocaleString()}</div>
        </div>

        <div class="mineRow">
          <button class="mineBtn">Start Mining</button>
        </div>
      `;

      const btn = card.querySelector(".mineBtn");

      btn.addEventListener("click", () => {
        startMining(docItem.id, d.rate || 0, d.endTime);
      });

      list.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "<p style='color:red'>Failed to load airdrops</p>";
  }
};

// ---------------- START MINING ----------------
async function startMining(id, rate, endTime) {
  const userRef = doc(db, "users", uid);
  const stateRef = doc(db, "users", uid, "airdropState", id);

  const snap = await getDoc(stateRef);

  if (!snap.exists()) {
    await setDoc(stateRef, {
      mined: 0,
      rate,
      endTime,
      active: true
    });
  }

  alert("Mining started 🚀");

  if (miningIntervals[id]) clearInterval(miningIntervals[id]);

  miningIntervals[id] = setInterval(async () => {
    const s = await getDoc(stateRef);

    if (!s.exists()) return;

    const data = s.data();

    const now = Date.now();
    const end = data.endTime;

    if (now > end) {
      clearInterval(miningIntervals[id]);
      alert("⛔ Airdrop ended");
      return;
    }

    const add = (data.rate || 0) / 10;
    const newVal = (data.mined || 0) + add;

    await updateDoc(stateRef, { mined: newVal });
    await updateDoc(userRef, { airdropBalance: newVal });

    balanceEl.innerText = newVal.toFixed(6);

  }, 3000);
}