import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
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
let runningIntervals = {};

/* ---------------- LOGIN ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "login.html";
  uid = user.uid;

  listenBalance();
});

/* ---------------- REAL BALANCE LISTENER ---------------- */
function listenBalance() {
  onSnapshot(doc(db, "airdropUsers", uid), (snap) => {
    if (!snap.exists()) return;
    balanceUI.innerText = (snap.data().balance || 0).toFixed(6);
  });
}

/* ---------------- SEARCH AIRDROPS ---------------- */
searchBtn.onclick = async () => {

  list.innerHTML = "Loading airdrops...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    list.innerHTML += `
      <div class="card">
        🚀 <b>${data.name}</b><br>
        💰 Rate: ${data.rate}<br>
        📅 Start: ${new Date(data.startTime).toLocaleString()}<br>
        📅 End: ${new Date(data.endTime).toLocaleString()}<br>

        <button class="btn start" onclick="startAirdrop('${d.id}', ${data.rate}, ${data.endTime})">
          START AIRDROP
        </button>

        <button class="btn stop" onclick="stopAirdrop('${d.id}')">
          STOP AIRDROP
        </button>
      </div>
    `;
  });
};

/* ---------------- START AIRDROP ---------------- */
window.startAirdrop = async (id, rate, endTime) => {

  const ref = doc(db, "airdropUsers", uid, "active", id);
  const userRef = doc(db, "airdropUsers", uid);

  const snap = await getDoc(userRef);

  let balance = snap.exists() ? snap.data().balance || 0 : 0;

  await setDoc(userRef, { balance }, { merge: true });
  await setDoc(ref, { rate, endTime, running: true });

  runMining(id, rate, endTime);

  alert("Airdrop Started 🚀");
};

/* ---------------- MINING ENGINE ---------------- */
function runMining(id, rate, endTime) {

  if (runningIntervals[id]) clearInterval(runningIntervals[id]);

  runningIntervals[id] = setInterval(async () => {

    const now = Date.now();

    if (now >= endTime) {
      clearInterval(runningIntervals[id]);
      alert("Airdrop ended ⛔");
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

/* ---------------- STOP AIRDROP ---------------- */
window.stopAirdrop = (id) => {
  if (runningIntervals[id]) {
    clearInterval(runningIntervals[id]);
    delete runningIntervals[id];
  }
  alert("Stopped");
};