import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc
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

let user = null;
let timers = {};

const list = document.getElementById("list");
const activeCount = document.getElementById("activeCount");

onAuthStateChanged(auth, async (u) => {
  if (!u) return;
  user = u;

  await loadAirdrops();
  await restoreMining();
});

document.getElementById("searchBtn").onclick = loadAirdrops;

// 🔥 LOAD AIRDROPS
async function loadAirdrops(){
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(d => render(d.id, d.data()));
}

// 🔥 UI CARD
function render(id, data){

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="title">${data.name}</div>
    <div class="desc">${data.description}</div>

    <div class="grid">
      <div>💰 Rate: ${data.rate}</div>
      <div>📦 Amount: ${data.amount}</div>
      <div>📅 Start: ${data.startDate || "N/A"}</div>
      <div>⛔ End: ${data.endDate || "N/A"}</div>
      <div>⏰ Start Time: ${data.startTime || "N/A"}</div>
      <div>⌛ End Time: ${data.endTime || "N/A"}</div>
    </div>

    <div class="balance">
      Balance: <span id="bal-${id}">0.00000000</span>
    </div>

    <div class="actions">
      <button class="start">Start Mining</button>
      <button class="stop">Stop Mining</button>
      <button class="withdraw">Withdraw</button>
    </div>

    <input id="w-${id}" placeholder="Enter withdrawal amount">

    <div class="desc">
      If you place withdrawal, it will be added to your withdrawal balance after admin approval.
    </div>
  `;

  card.querySelector(".start").onclick = () => startMining(id, parseFloat(data.rate || 0));
  card.querySelector(".stop").onclick = () => stopMining(id);
  card.querySelector(".withdraw").onclick = () => withdraw(id);

  list.appendChild(card);
}

// 🔥 START MINING
function startMining(id, rate){

  if(timers[id]) return;

  let balance = 0;

  timers[id] = setInterval(async () => {

    balance += rate;

    document.getElementById("bal-" + id).innerText = balance.toFixed(8);

    await setDoc(doc(db, "users", user.uid, "airdropState", id), {
      active:true,
      balance,
      rate,
      updatedAt: Date.now()
    }, { merge:true });

    updateCount();

  }, 2000);
}

// 🔥 STOP MINING
function stopMining(id){

  clearInterval(timers[id]);
  delete timers[id];

  setDoc(doc(db, "users", user.uid, "airdropState", id), {
    active:false
  }, { merge:true });

  updateCount();
}

// 🔥 WITHDRAW (CLEAN + SIMPLE)
async function withdraw(id){

  const amount = document.getElementById("w-" + id).value;

  await setDoc(doc(collection(db, "airdropWithdrawals")), {
    userId: user.uid,
    airdropId: id,
    amount: Number(amount),
    status: "pending",
    createdAt: Date.now()
  });

  alert("Withdrawal submitted successfully!");
}

// 🔥 RESTORE AFTER LOGIN
async function restoreMining(){

  const snap = await getDocs(collection(db, "users", user.uid, "airdropState"));

  snap.forEach(d => {
    const data = d.data();
    if(data.active){
      startMining(d.id, data.rate || 0);
    }
  });

  updateCount();
}

function updateCount(){
  activeCount.innerText = Object.keys(timers).length;
}