import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase
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

let miningData = {}; // track miners

// ================= CREATE AIRDROP =================
window.createAirdrop = async function () {
  await addDoc(collection(db, "airdropCampaigns"), {
    name: name.value,
    rate: Number(rate.value),
    price: Number(price.value),
    startTime: new Date(start.value).getTime(),
    endTime: new Date(end.value).getTime(),
    active: true,
    createdAt: serverTimestamp()
  });

  alert("Airdrop Created 🚀");
  loadAirdrops();
};

// ================= LOAD AIRDROPS =================
async function loadAirdrops() {
  const snap = await getDocs(collection(db, "airdropCampaigns"));
  const box = document.getElementById("airdrops");

  box.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${data.name}</b><br>
      💰 Price: ${data.price}<br>
      ⛏ Rate: ${data.rate}<br>
      📅 Start: ${new Date(data.startTime)}<br>
      📅 End: ${new Date(data.endTime)}<br>
      Status: ${data.active ? "🟢 Running" : "🔴 Stopped"}<br>

      <button onclick="start('${d.id}')">🟢 Start</button>
      <button onclick="stop('${d.id}')">🔴 Stop</button>
    `;

    box.appendChild(div);
  });
}

// ================= START / STOP =================
window.start = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), { active: true });
  loadAirdrops();
};

window.stop = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), { active: false });
  loadAirdrops();
};

// ================= FETCH WITHDRAWALS =================
window.fetchWithdrawals = async function () {
  const snap = await getDocs(collection(db, "pendingWithdrawals"));
  const box = document.getElementById("withdrawals");

  box.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      👤 User: ${data.userId}<br>
      💰 Amount: ${data.amount}<br>
      Status: ${data.status || "pending"}<br>

      <button onclick="approve('${d.id}', '${data.userId}', ${data.amount})">✅ Approve</button>
      <button onclick="reject('${d.id}', '${data.userId}', ${data.amount})">❌ Reject</button>
    `;

    box.appendChild(div);
  });
};

// ================= APPROVE =================
window.approve = async (id, uid, amount) => {

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  let mainBal = snap.data().balance || 0;
  let airBal = snap.data().airdropBalance || 0;

  await updateDoc(userRef, {
    balance: mainBal + amount,
    airdropBalance: airBal - amount
  });

  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "approved"
  });

  alert("Approved ✅");
};

// ================= REJECT =================
window.reject = async (id, uid, amount) => {

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  let airBal = snap.data().airdropBalance || 0;

  await updateDoc(userRef, {
    airdropBalance: airBal + amount
  });

  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "rejected"
  });

  alert("Rejected ❌");
};

// INIT
loadAirdrops();