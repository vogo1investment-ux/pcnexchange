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

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// ================= CREATE AIRDROP =================
document.getElementById("createBtn").onclick = async () => {
  const name = document.getElementById("name").value;
  const rate = Number(document.getElementById("rate").value);
  const price = Number(document.getElementById("price").value);
  const duration = Number(document.getElementById("duration").value);

  const now = Date.now();

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    price,
    startTime: now,
    endTime: now + duration * 60000,
    status: "stopped",
    creator: ADMIN_UID
  });

  alert("Airdrop Created");
  loadAirdrops();
};

// ================= START ALL (THIS WAS MISSING) =================
document.getElementById("startAll").onclick = async () => {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  snap.forEach(async (d) => {
    await updateDoc(doc(db, "airdropCampaigns", d.id), {
      status: "running",
      startTime: Date.now()
    });
  });

  alert("Airdrops Started");
  loadAirdrops();
};

// ================= STOP ALL =================
document.getElementById("stopAll").onclick = async () => {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  snap.forEach(async (d) => {
    await updateDoc(doc(db, "airdropCampaigns", d.id), {
      status: "stopped",
      endTime: Date.now()
    });
  });

  alert("Airdrops Stopped");
  loadAirdrops();
};

// ================= LOAD AIRDROPS =================
async function loadAirdrops() {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  const active = document.getElementById("activeList");
  const ended = document.getElementById("endedList");

  active.innerHTML = "";
  ended.innerHTML = "";

  snap.forEach(d => {
    const x = d.data();

    const html = `
      <div class="item">
        <b>Coin:</b> ${x.name}<br>
        <b>Rate:</b> ${x.rate}<br>
        <b>Price:</b> $${x.price}<br>
        <b>Creator:</b> ${x.creator}<br>
        <b>Start:</b> ${new Date(x.startTime).toLocaleString()}<br>
        <b>End:</b> ${new Date(x.endTime).toLocaleString()}<br>
        <b>Status:</b> ${x.status}
      </div>
    `;

    if (x.status === "running") active.innerHTML += html;
    else ended.innerHTML += html;
  });
}

// ================= WITHDRAWALS =================
async function loadWithdrawals() {
  const snap = await getDocs(collection(db, "airdropWithdrawals"));

  const box = document.getElementById("withdrawList");
  box.innerHTML = "";

  snap.forEach(d => {
    const x = d.data();

    box.innerHTML += `
      <div class="item">
        User: ${x.uid}<br>
        Amount: ${x.amount}<br>
        Status: ${x.status}<br>
        <button onclick="approve('${d.id}')">Approve</button>
      </div>
    `;
  });
}

window.approve = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "approved"
  });

  loadWithdrawals();
};

// INIT
loadAirdrops();
loadWithdrawals();