import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc
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

let userId = null;
let intervals = {};

const airdropsDiv = document.getElementById("airdrops");

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  userId = user.uid;
  loadAirdrops();
});

document.getElementById("loadBtn").onclick = loadAirdrops;

// ---------------- LOAD AIRDROPS ----------------
async function loadAirdrops() {
  airdropsDiv.innerHTML = "";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  snap.forEach(async (d) => {
    const data = d.data();
    renderAirdrop(d.id, data);
  });
}

// ---------------- RENDER AIRDROP ----------------
async function renderAirdrop(id, data) {

  const userRef = doc(db, "users", userId, "airdropState", id);
  const userSnap = await getDoc(userRef);

  let state = userSnap.exists() ? userSnap.data() : {
    balance: 0,
    active: false,
    lastUpdate: Date.now()
  };

  const box = document.createElement("div");
  box.className = "airdrop";

  box.innerHTML = `
    <h2>${data.name}</h2>

    <div class="row">${data.description}</div>

    <div class="row">💰 Rate: ${data.rate}</div>
    <div class="row">📦 Amount: ${data.amount}</div>

    <div class="row">🟢 Start: ${format(data.startTime)}</div>
    <div class="row">🔴 End: ${format(data.endTime)}</div>

    <div class="balance">Balance: ${state.balance.toFixed(8)}</div>

    <button class="btn green" id="start-${id}">Start Mining</button>
    <button class="btn red" id="stop-${id}">Stop Mining</button>

    <button class="btn yellow" id="withdraw-${id}">
      Withdraw
    </button>

    <div class="notice">
      If you place withdrawal, it will be added to your withdrawable balance after admin approval.
    </div>
  `;

  airdropsDiv.appendChild(box);

  // START MINING
  document.getElementById(`start-${id}`).onclick = async () => {
    state.active = true;
    state.lastUpdate = Date.now();
    await setDoc(userRef, state);

    startMining(id, data, state, userRef, box);
  };

  // STOP MINING
  document.getElementById(`stop-${id}`).onclick = async () => {
    state.active = false;
    await updateDoc(userRef, state);
    clearInterval(intervals[id]);
  };

  // WITHDRAW (NO PAGE CHANGE)
  document.getElementById(`withdraw-${id}`).onclick = async () => {
    await setDoc(doc(collection(db, "airdropWithdrawals")), {
      userId,
      airdropId: id,
      amount: state.balance,
      createdAt: Date.now(),
      status: "pending"
    });

    state.balance = 0;
    state.active = false;

    await setDoc(userRef, state);

    alert("Withdrawal submitted successfully!");
    box.querySelector(".balance").innerText = "Balance: 0.00000000";
  };

  // AUTO CONTINUE IF ACTIVE
  if (state.active) {
    startMining(id, data, state, userRef, box);
  }
}

// ---------------- MINING ENGINE ----------------
function startMining(id, data, state, ref, box) {

  clearInterval(intervals[id]);

  intervals[id] = setInterval(async () => {

    const now = Date.now();

    // stop if ended
    if (now > data.endTime) {
      clearInterval(intervals[id]);
      return;
    }

    if (!state.active) return;

    let diff = (now - state.lastUpdate) / 1000;
    let earned = diff * Number(data.rate);

    state.balance += earned;
    state.lastUpdate = now;

    box.querySelector(".balance").innerText =
      "Balance: " + state.balance.toFixed(8);

    await setDoc(ref, state);

  }, 2000);
}

// ---------------- FORMAT DATE ----------------
function format(ts) {
  if (!ts) return "Not Set";
  return new Date(ts).toLocaleString();
}