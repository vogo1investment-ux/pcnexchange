import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ---------------- FIREBASE ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- VARIABLES ----------------
let uid = null;
let balance = 0;
let miningIntervals = {};

const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("list");

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  uid = user.uid;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { balance: 0 });
  } else {
    balance = snap.data().balance || 0;
  }

  balanceEl.innerText = Number(balance).toFixed(8);
});

// ---------------- LOAD AIRDROPS ----------------
window.loadAirdrops = async function () {
  listEl.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  listEl.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const box = document.createElement("div");
    box.className = "card";

    box.innerHTML = `
      <h3>🚀 ${data.name}</h3>
      <p>⚡ Rate: ${data.rate}</p>
      <p>📅 Start: ${new Date(data.startTime).toLocaleString()}</p>
      <p>📅 End: ${new Date(data.endTime).toLocaleString()}</p>

      <button class="green" onclick="startMining('${d.id}', ${data.rate}, ${data.endTime})">
        ▶ Start Mining
      </button>
    `;

    listEl.appendChild(box);
  });
};

// ---------------- MINING ----------------
window.startMining = function (id, rate, endTime) {

  if (miningIntervals[id]) return;

  miningIntervals[id] = setInterval(async () => {

    if (Date.now() > endTime) {
      clearInterval(miningIntervals[id]);
      alert("Airdrop ended");
      return;
    }

    balance += rate;
    balanceEl.innerText = balance.toFixed(8);

    if (uid) {
      await updateDoc(doc(db, "users", uid), {
        balance: balance
      });
    }

  }, 1000);
};

// ---------------- WITHDRAW PAGE ----------------
window.goWithdraw = function () {
  window.location.href = "WithdrawAirdrop.html";
};