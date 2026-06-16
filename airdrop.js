import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
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

let uid;

// per airdrop balances + intervals
let balances = {};
let intervals = {};
let active = 0;

const list = document.getElementById("airdropList");
const activeCount = document.getElementById("activeCount");

// format
const fmt = (n) => Number(n).toFixed(8);

// auth
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  uid = user.uid;
});

// LOAD BUTTON
document.getElementById("loadAirdropsBtn").addEventListener("click", loadAirdrops);

async function loadAirdrops() {

  list.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(doc => {

    const d = doc.data();
    const id = doc.id;

    if (!balances[id]) balances[id] = 0;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="title">🚀 ${d.name}</div>

      <div class="row">📝 ${d.desc || "No description"}</div>
      <div class="row">⚡ Rate: ${d.rate}</div>
      <div class="row">📅 Start: ${d.start}</div>
      <div class="row">📅 End: ${d.end}</div>

      <div class="balance">
        💰 Balance: <span id="bal-${id}">${fmt(balances[id])}</span>
      </div>

      <button class="start">▶ Start</button>
      <button class="stop">⛔ Stop</button>
      <button class="withdraw">💸 Withdraw</button>
    `;

    // START
    card.querySelector(".start").onclick = () => {
      startMining(id, d.rate);
    };

    // STOP
    card.querySelector(".stop").onclick = () => {
      stopMining(id);
    };

    // WITHDRAW
    card.querySelector(".withdraw").onclick = async () => {

      await addDoc(collection(db, "airdropWithdrawals"), {
        userId: uid,
        airdropId: id,
        amount: balances[id],
        status: "pending",
        createdAt: Date.now()
      });

      window.location.href = "withdrawairdrop.html";
    };

    list.appendChild(card);
  });
}

// START MINING
function startMining(id, rate) {

  if (intervals[id]) return;

  active++;
  activeCount.innerText = active;

  intervals[id] = setInterval(() => {

    balances[id] += Number(rate);

    document.getElementById(`bal-${id}`).innerText = fmt(balances[id]);

  }, 1000);
}

// STOP MINING
function stopMining(id) {

  clearInterval(intervals[id]);
  delete intervals[id];

  active = Math.max(0, active - 1);
  activeCount.innerText = active;
}