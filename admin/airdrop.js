import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
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

let currentBatchId = null;

---

# 🟢 CREATE AIRDROP

window.createAirdrop = async function () {

  const name = document.getElementById("name").value;
  const rate = parseFloat(document.getElementById("rate").value);
  const start = new Date(document.getElementById("start").value).getTime();
  const end = new Date(document.getElementById("end").value).getTime();

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    start,
    end,
    isActive: false,
    createdAt: serverTimestamp()
  });

  alert("Airdrop Created 🚀");
};

---

# 📡 LOAD AIRDROPS

window.loadAirdrops = async function () {

  const list = document.getElementById("airdropList");
  list.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach((d) => {

    const a = d.data();

    const div = document.createElement("div");
    div.className = "box";

    div.innerHTML = `
      🚀 <b>${a.name}</b><br>
      💰 Rate: ${a.rate}<br>
      ⏰ Start: ${new Date(a.start).toLocaleString()}<br>
      ⏳ End: ${new Date(a.end).toLocaleString()}<br>
      🔥 Active: ${a.isActive}<br><br>

      <button class="start" onclick="startAirdrop('${d.id}')">🟢 Start</button>
      <button class="stop" onclick="stopAirdrop('${d.id}')">🔴 Stop</button>
    `;

    list.appendChild(div);
  });
};

---

# 🟢 START AIRDROP

window.startAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    isActive: true
  });

  alert("Airdrop Started 🚀");
};

---

# 🔴 STOP AIRDROP

window.stopAirdrop = async function (id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    isActive: false
  });

  alert("Airdrop Stopped ⛔");
};

---

# 🟢 NEW: START WITHDRAWAL BATCH (IMPORTANT)

window.startWithdrawalBatch = async function () {

  const batchRef = await addDoc(collection(db, "airdropWithdrawals"), {
    status: "active",
    createdAt: serverTimestamp()
  });

  currentBatchId = batchRef.id;

  alert("Withdrawal Batch Started 🟢");
};

---

# 🔵 FETCH WITHDRAWALS (ONLY THIS SYSTEM)

window.fetchWithdrawals = async function () {

  const box = document.getElementById("withdrawals");
  box.innerHTML = "Loading...";

  const batches = await getDocs(collection(db, "airdropWithdrawals"));

  box.innerHTML = "";

  batches.forEach(async (batch) => {

    const requests = await getDocs(
      collection(db, "airdropWithdrawals", batch.id, "requests")
    );

    const container = document.createElement("div");
    container.className = "box";

    container.innerHTML = `📦 Batch: ${batch.id}<br><br>`;

    requests.forEach((r) => {

      const w = r.data();

      const item = document.createElement("div");

      item.innerHTML = `
        👤 ${w.userId} <br>
        💰 ${w.amount} <br>
        📌 ${w.status} <br><br>

        <button class="start" onclick="approve('${batch.id}','${r.id}','${w.userId}',${w.amount})">✔️ Approve</button>
        <button class="stop" onclick="reject('${batch.id}','${r.id}')">❌ Reject</button>
        <hr>
      `;

      container.appendChild(item);
    });

    box.appendChild(container);
  });
};

---

# ✔️ APPROVE

window.approve = async function (batchId, reqId, userId, amount) {

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    balance: 0
  });

  await updateDoc(
    doc(db, "airdropWithdrawals", batchId, "requests", reqId),
    { status: "approved" }
  );

  alert("Approved ✔️");
};

---

# ❌ REJECT

window.reject = async function (batchId, reqId) {

  await updateDoc(
    doc(db, "airdropWithdrawals", batchId, "requests", reqId),
    { status: "rejected" }
  );

  alert("Rejected ❌");
};