import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

let userId;
let timers = {};
let activeCount = 0;

onAuthStateChanged(auth, (user) => {
  if (user) userId = user.uid;
});

document.getElementById("discoverBtn").onclick = loadAirdrops;

async function loadAirdrops() {
  const snap = await getDocs(collection(db, "airdropCampaigns"));
  const list = document.getElementById("airdropList");

  list.innerHTML = "";

  snap.forEach(async (docSnap) => {
    renderAirdrop(docSnap.id, docSnap.data());
  });
}

async function renderAirdrop(id, data) {

  const stateRef = doc(db, "users", userId, "airdropState", id);
  const stateSnap = await getDoc(stateRef);

  let state = stateSnap.exists() ? stateSnap.data() : {
    balance: 0,
    active: false,
    lastTime: Date.now()
  };

  const box = document.createElement("div");
  box.className = "card";

  box.innerHTML = `
    <div class="title">${data.name}</div>

    <div class="row">📝 ${data.description}</div>
    <div class="row">⚡ Rate: ${data.rate}</div>
    <div class="row">📦 Amount: ${data.amount}</div>

    <div class="row">🟢 Start: ${new Date(data.startTime).toLocaleString()}</div>
    <div class="row">🔴 End: ${new Date(data.endTime).toLocaleString()}</div>

    <div class="balance">Balance: ${state.balance.toFixed(8)}</div>

    <button class="start">Start Mining</button>
    <button class="stop">Stop Mining</button>
    <button class="withdraw">Withdraw</button>

    <div class="notice">
      Withdrawal Notice: Upon submission, your request will be reviewed and credited to your withdrawable balance after administrative approval. This action is irreversible once confirmed.
    </div>
  `;

  document.getElementById("airdropList").appendChild(box);

  const startBtn = box.querySelector(".start");
  const stopBtn = box.querySelector(".stop");
  const withdrawBtn = box.querySelector(".withdraw");

  startBtn.onclick = async () => {
    state.active = true;
    state.lastTime = Date.now();

    await setDoc(stateRef, state);

    activeCount++;
    document.getElementById("activeCount").innerText = activeCount;

    startMining(id, data, state, stateRef, box);
  };

  stopBtn.onclick = async () => {
    state.active = false;
    await setDoc(stateRef, state);

    clearInterval(timers[id]);
    activeCount--;
    document.getElementById("activeCount").innerText = activeCount;
  };

  withdrawBtn.onclick = async () => {

    // 🔥 creates withdrawal (NO new page)
    await addDoc(collection(db, "airdropWithdrawals"), {
      userId,
      airdropId: id,
      amount: state.balance,
      status: "pending",
      createdAt: Date.now()
    });

    state.balance = 0;
    state.active = false;

    await setDoc(stateRef, state);

    box.querySelector(".balance").innerText = "Balance: 0.00000000";

    alert("Withdrawal submitted successfully.");
  };

  if (state.active) {
    startMining(id, data, state, stateRef, box);
  }
}

function startMining(id, data, state, ref, box) {

  clearInterval(timers[id]);

  timers[id] = setInterval(async () => {

    const now = Date.now();

    if (now < data.startTime || now > data.endTime) return;

    if (!state.active) return;

    const diff = (now - state.lastTime) / 1000;
    const earned = diff * Number(data.rate);

    state.balance += earned;
    state.lastTime = now;

    box.querySelector(".balance").innerText =
      "Balance: " + state.balance.toFixed(8);

    await setDoc(ref, state);

  }, 2000);
}