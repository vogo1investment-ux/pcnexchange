import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  setDoc
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

/* ===================== CREATE AIRDROP ===================== */
window.createAirdrop = async function () {
  const name = document.getElementById("name").value;
  const rate = Number(document.getElementById("rate").value || 0.00000001);
  const price = Number(document.getElementById("price").value || 0);
  const start = new Date(document.getElementById("start").value).getTime();
  const end = new Date(document.getElementById("end").value).getTime();

  if (!name || !start || !end) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    price,
    startTime: start,
    endTime: end,
    active: false,
    createdAt: serverTimestamp()
  });

  alert("Airdrop created 🚀");
  loadAirdrops();
};

/* ===================== LOAD AIRDROPS ===================== */
window.loadAirdrops = async function () {
  const box = document.getElementById("airdrops");
  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  box.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>🚀 ${data.name}</b><br>
      💰 Price: ${data.price}<br>
      ⛏ Rate: ${data.rate}<br>
      📅 Start: ${new Date(data.startTime)}<br>
      📅 End: ${new Date(data.endTime)}<br>
      Status: ${data.active ? "🟢 Active" : "🔴 Stopped"}<br><br>

      <button onclick="startAirdrop('${d.id}')">🟢 Start</button>
      <button onclick="stopAirdrop('${d.id}')">🔴 Stop</button>
    `;

    box.appendChild(div);
  });
};

/* ===================== START / STOP AIRDROP ===================== */
window.startAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    active: true
  });
  loadAirdrops();
};

window.stopAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    active: false
  });
  loadAirdrops();
};

/* ===================== MINERS VIEW (ADMIN) ===================== */
window.loadMiners = async function () {
  const box = document.getElementById("miners");
  if (!box) return;

  const usersSnap = await getDocs(collection(db, "users"));

  box.innerHTML = "";

  usersSnap.forEach(async (u) => {
    const uid = u.id;

    const subSnap = await getDocs(collection(db, "users", uid, "airdropState"));

    subSnap.forEach(m => {
      const data = m.data();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        👤 User: ${uid}<br>
        ⛏ Airdrop: ${data.airdropId}<br>
        💰 Mined: ${data.mined}<br>
      `;

      box.appendChild(div);
    });
  });
};

/* ===================== FETCH WITHDRAWALS ===================== */
window.fetchWithdrawals = async function () {
  const box = document.getElementById("withdrawals");
  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "pendingWithdrawals"));

  box.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      👤 ${data.userId}<br>
      💰 ${data.amount}<br>
      Status: ${data.status || "pending"}<br><br>

      <button onclick="approve('${d.id}','${data.userId}',${data.amount})">✅ Approve</button>
      <button onclick="reject('${d.id}','${data.userId}',${data.amount})">❌ Reject</button>
    `;

    box.appendChild(div);
  });
};

/* ===================== APPROVE ===================== */
window.approve = async function (id, uid, amount) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  let balance = snap.data().balance || 0;

  await updateDoc(userRef, {
    balance: balance + amount,
    airdropBalance: 0
  });

  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "approved"
  });

  alert("Approved ✅");
};

/* ===================== REJECT ===================== */
window.reject = async function (id, uid, amount) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  let air = snap.data().airdropBalance || 0;

  await updateDoc(userRef, {
    airdropBalance: air + amount
  });

  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "rejected"
  });

  alert("Rejected ❌");
};

/* AUTO LOAD */
loadAirdrops();