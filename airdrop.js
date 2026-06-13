import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const balanceUI = document.getElementById("balance");
const list = document.getElementById("list");
const searchBtn = document.getElementById("searchBtn");

let uid;
let miningIntervals = {};

/* ---------------- LOGIN ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  uid = user.uid;

  listenBalance();
  loadRunningAirdrops();
});

/* ---------------- BALANCE LISTENER ---------------- */
function listenBalance() {
  onSnapshot(doc(db, "airdropUsers", uid), (snap) => {
    if (!snap.exists()) {
      balanceUI.innerText = "0.000000";
      return;
    }

    balanceUI.innerText = (snap.data().balance || 0).toFixed(6);
  });
}

/* ---------------- SEARCH AIRDROPS ---------------- */
searchBtn.onclick = async () => {
  list.innerHTML = "Loading airdrops...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "No airdrops found";
      return;
    }

    snap.forEach((d) => {
      const data = d.data();

      list.innerHTML += `
        <div class="card">
          🚀 <b>${data.name}</b><br>
          💰 Rate: ${data.rate}<br>
          📅 Start: ${new Date(data.startTime).toLocaleString()}<br>
          📅 End: ${new Date(data.endTime).toLocaleString()}<br>

          <button class="btn blue"
            onclick="startAirdrop('${d.id}', ${data.rate}, ${data.endTime})">
            START AIRDROP
          </button>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "❌ Failed to load airdrops";
  }
};

/* ---------------- START AIRDROP ---------------- */
window.startAirdrop = async (id, rate, endTime) => {

  const userRef = doc(db, "airdropUsers", uid);
  const activeRef = doc(db, "airdropUsers", uid, "active", id);

  await setDoc(activeRef, {
    rate,
    endTime,
    running: true
  });

  runMining(id, rate, endTime);

  alert("Airdrop Started 🚀");
};

/* ---------------- AUTO LOAD RUNNING AIRDROPS ---------------- */
async function loadRunningAirdrops() {
  const snap = await getDocs(collection(db, "airdropUsers", uid, "active"));

  snap.forEach((d) => {
    const data = d.data();
    runMining(d.id, data.rate, data.endTime);
  });
}

/* ---------------- MINING ENGINE ---------------- */
function runMining(id, rate, endTime) {

  if (miningIntervals[id]) clearInterval(miningIntervals[id]);

  miningIntervals[id] = setInterval(async () => {

    const now = Date.now();

    if (now >= endTime) {
      clearInterval(miningIntervals[id]);
      delete miningIntervals[id];
      return;
    }

    const userRef = doc(db, "airdropUsers", uid);
    const snap = await getDoc(userRef);

    let balance = snap.exists() ? snap.data().balance || 0 : 0;

    balance += Number(rate);

    await setDoc(userRef, { balance }, { merge: true });

    balanceUI.innerText = balance.toFixed(6);

  }, 3000);
}