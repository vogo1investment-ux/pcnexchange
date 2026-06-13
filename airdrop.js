import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp
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
let interval = null;

const list = document.getElementById("airdropList");
const balanceBox = document.getElementById("balanceBox");

// AUTH
onAuthStateChanged(auth, user => {
  if (!user) return location.href = "login.html";
  uid = user.uid;

  loadAirdrops();
  loadBalance();
});

// LOAD AIRDROPS
async function loadAirdrops() {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>Rate: ${data.rate}/sec</p>
      <p>Price: $${data.price}</p>
      <button onclick="startMining('${d.id}', ${data.rate})">Start</button>
    `;

    list.appendChild(div);
  });
}

// START MINING
window.startMining = async (coinId, rate) => {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    miningActive: true,
    currentCoin: coinId
  });

  alert("Mining started");

  if (interval) clearInterval(interval);

  interval = setInterval(async () => {
    const snap = await getDoc(ref);
    let bal = snap.data()?.airdropBalance || 0;

    bal += rate;

    await updateDoc(ref, {
      airdropBalance: bal
    });

    loadBalance();
  }, 3000);
};

// LOAD BALANCE
async function loadBalance() {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  balanceBox.innerHTML =
    "Balance: " + (snap.data()?.airdropBalance || 0).toFixed(6);
}

// WITHDRAW
window.withdraw = async () => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const amount = snap.data()?.airdropBalance || 0;

  await addDoc(collection(db, "airdropWithdrawals"), {
    uid,
    amount,
    status: "pending",
    createdAt: serverTimestamp()
  });

  await updateDoc(ref, {
    airdropBalance: 0,
    miningActive: false
  });

  alert("Withdrawal sent to admin");
};