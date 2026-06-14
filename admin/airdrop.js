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

/* FIREBASE CONFIG */
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

/* =========================
   CREATE AIRDROP
========================= */
window.createAirdrop = async function () {
  const name = document.getElementById("name").value;
  const rate = parseFloat(document.getElementById("rate").value);
  const start = new Date(document.getElementById("start").value).getTime();
  const end = new Date(document.getElementById("end").value).getTime();

  try {
    await addDoc(collection(db, "airdropCampaigns"), {
      name,
      rate,
      start,
      end,
      isActive: false,
      createdAt: serverTimestamp()
    });

    alert("✅ Airdrop Created");
  } catch (e) {
    alert("❌ Error creating airdrop");
    console.error(e);
  }
};

/* =========================
   LOAD AIRDROPS
========================= */
window.loadAirdrops = async function () {
  const list = document.getElementById("airdropList");
  list.innerHTML = "Loading...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    list.innerHTML = "";

    snap.forEach((docSnap) => {
      const a = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "box";

      div.innerHTML = `
        🚀 <b>${a.name || "Airdrop"}</b><br>
        💰 Rate: ${a.rate || 0}<br>
        ⏰ Start: ${new Date(a.start).toLocaleString()}<br>
        ⏳ End: ${new Date(a.end).toLocaleString()}<br>
        🔥 Active: ${a.isActive ? "YES" : "NO"}<br><br>

        <button class="start" onclick="startAirdrop('${id}')">🟢 Start</button>
        <button class="stop" onclick="stopAirdrop('${id}')">🔴 Stop</button>
      `;

      list.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    list.innerHTML = "Error loading airdrops";
  }
};

/* =========================
   START AIRDROP
========================= */
window.startAirdrop = async function (id) {
  try {
    await updateDoc(doc(db, "airdropCampaigns", id), {
      isActive: true
    });

    alert("🟢 Airdrop Started");
    loadAirdrops();
  } catch (e) {
    console.error(e);
    alert("❌ Failed to start");
  }
};

/* =========================
   STOP AIRDROP
========================= */
window.stopAirdrop = async function (id) {
  try {
    await updateDoc(doc(db, "airdropCampaigns", id), {
      isActive: false
    });

    alert("🔴 Airdrop Stopped");
    loadAirdrops();
  } catch (e) {
    console.error(e);
    alert("❌ Failed to stop");
  }
};

/* =========================
   WITHDRAWALS SYSTEM
========================= */
window.fetchWithdrawals = async function () {
  const box = document.getElementById("withdrawals");
  box.innerHTML = "Loading...";

  try {
    const batches = await getDocs(collection(db, "airdropWithdrawals"));

    box.innerHTML = "";

    for (const batch of batches.docs) {
      const batchId = batch.id;

      const requests = await getDocs(
        collection(db, "airdropWithdrawals", batchId, "requests")
      );

      const container = document.createElement("div");
      container.className = "box";

      container.innerHTML = `📦 Batch: ${batchId}<br><br>`;

      requests.forEach((r) => {
        const w = r.data();

        const item = document.createElement("div");
        item.innerHTML = `
          👤 User: ${w.userId}<br>
          💰 Amount: ${w.amount}<br>
          📌 Status: ${w.status || "pending"}<br><br>

          <button class="start" onclick="approve('${batchId}','${r.id}','${w.userId}',${w.amount})">✔ Approve</button>
          <button class="stop" onclick="reject('${batchId}','${r.id}')">✖ Reject</button>
          <hr>
        `;

        container.appendChild(item);
      });

      box.appendChild(container);
    }

  } catch (e) {
    console.error(e);
    box.innerHTML = "Error loading withdrawals";
  }
};

/* =========================
   APPROVE
========================= */
window.approve = async function (batchId, reqId, userId, amount) {
  try {
    await updateDoc(
      doc(db, "airdropWithdrawals", batchId, "requests", reqId),
      { status: "approved" }
    );

    alert("✔ Approved");
  } catch (e) {
    console.error(e);
    alert("❌ Failed approve");
  }
};

/* =========================
   REJECT
========================= */
window.reject = async function (batchId, reqId) {
  try {
    await updateDoc(
      doc(db, "airdropWithdrawals", batchId, "requests", reqId),
      { status: "rejected" }
    );

    alert("✖ Rejected");
  } catch (e) {
    console.error(e);
    alert("❌ Failed reject");
  }
};