import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

/* ADMIN ID */
const ADMIN_ID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

/* ---------------- CREATE AIRDROP ---------------- */
window.createAirdrop = async function () {
  const name = document.getElementById("name").value;
  const rate = parseFloat(document.getElementById("rate").value);
  const start = new Date(document.getElementById("start").value).getTime();
  const end = new Date(document.getElementById("end").value).getTime();

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    startTime: start,
    endTime: end,
    isActive: false
  });

  alert("Airdrop created 🚀");
};

/* ---------------- LOAD AIRDROPS ---------------- */
window.loadAirdrops = async function () {
  const box = document.getElementById("airdropList");
  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));
  box.innerHTML = "";

  snap.forEach((d) => {
    const a = d.data();

    const div = document.createElement("div");
    div.className = "box";

    div.innerHTML = `
      <p>🚀 ${a.name}</p>
      <p>💰 Rate: ${a.rate}</p>
      <p>⏰ Start: ${new Date(a.startTime).toLocaleString()}</p>
      <p>⏳ End: ${new Date(a.endTime).toLocaleString()}</p>
      <p>🔥 Active: ${a.isActive}</p>

      <button class="start" onclick="startAirdrop('${d.id}')">Start 🟢</button>
      <button class="stop" onclick="stopAirdrop('${d.id}')">Stop 🔴</button>
    `;

    box.appendChild(div);
  });
};

/* ---------------- START AIRDROP ---------------- */
window.startAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    isActive: true
  });

  alert("Airdrop Started 🚀");
};

/* ---------------- STOP AIRDROP ---------------- */
window.stopAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    isActive: false
  });

  alert("Airdrop Stopped ⛔");
};

/* ---------------- FETCH WITHDRAWALS ---------------- */
window.fetchWithdrawals = async function () {
  const box = document.getElementById("withdrawals");
  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "withdrawalRequests"));
  box.innerHTML = "";

  snap.forEach((d) => {
    const w = d.data();

    const div = document.createElement("div");
    div.className = "box";

    div.innerHTML = `
      <p>👤 User: ${w.userId}</p>
      <p>💰 Amount: ${w.amount}</p>
      <p>📌 Status: ${w.status}</p>

      <button class="start" onclick="approve('${d.id}', '${w.userId}', ${w.amount})">Approve ✔️</button>
      <button class="stop" onclick="reject('${d.id}')">Reject ❌</button>
    `;

    box.appendChild(div);
  });
};

/* ---------------- APPROVE ---------------- */
window.approve = async function (id, userId, amount) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  let bal = userSnap.data().balance || 0;

  await updateDoc(userRef, {
    balance: bal - amount
  });

  await updateDoc(doc(db, "withdrawalRequests", id), {
    status: "approved"
  });

  alert("Approved ✔️");
};

/* ---------------- REJECT ---------------- */
window.reject = async function (id) {
  await updateDoc(doc(db, "withdrawalRequests", id), {
    status: "rejected"
  });

  alert("Rejected ❌");
};