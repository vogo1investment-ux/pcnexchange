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

const balanceBox = document.getElementById("balanceBox");
const list = document.getElementById("list");
const loadBtn = document.getElementById("loadBtn");

let uid = null;
let intervals = {};

// ---------------- LOGIN ----------------
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

  const data = snap.exists() ? snap.data() : {};

  balanceBox.innerHTML = `💰 Balance: ${data.airdropBalance || 0}`;
}

// ---------------- LOAD AIRDROPS ----------------
loadBtn.addEventListener("click", async () => {
  list.innerHTML = "Loading airdrops...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      list.innerHTML = "No airdrops available";
      return;
    }

    list.innerHTML = "";

    snap.forEach((docItem) => {
      const d = docItem.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="title">🚀 ${d.name}</div>
        <div class="small">💰 Price: ${d.price || 0}</div>
        <div class="small">⚡ Rate: ${d.rate}</div>
        <div class="small">📅 Start: ${new Date(d.startTime).toLocaleString()}</div>
        <div class="small">📅 End: ${new Date(d.endTime).toLocaleString()}</div>

        <button class="start">Start Mining</button>
      `;

      const btn = card.querySelector(".start");

      btn.addEventListener("click", () => {
        startMining(docItem.id, d.rate, d.endTime);
      });

      list.appendChild(card);
    });

  } catch (err) {
    console.log(err);
    list.innerHTML = "Failed to load airdrops";
  }
});

// ---------------- MINING ----------------
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

  alert("Mining started");

  if (intervals[id]) clearInterval(intervals[id]);

  intervals[id] = setInterval(async () => {

    const s = await getDoc(stateRef);
    if (!s.exists()) return;

    const data = s.data();

    if (Date.now() > data.endTime) {
      clearInterval(intervals[id]);
      alert("Airdrop ended");
      return;
    }

    const add = data.rate / 10;
    const newVal = (data.mined || 0) + add;

    await updateDoc(stateRef, { mined: newVal });
    await updateDoc(userRef, { airdropBalance: newVal });

    loadBalance();

  }, 3000);
}