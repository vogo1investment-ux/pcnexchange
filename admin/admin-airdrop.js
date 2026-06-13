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
  const duration = Number(document.getElementById("endTime").value);

  const now = Date.now();

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    price,
    startTime: now,
    endTime: now + duration * 60000,
    status: "stopped",
    creator: ADMIN_UID,
    createdAt: serverTimestamp()
  });

  alert("Airdrop created");
  loadAirdrops();
};

// ================= MASTER START =================
document.getElementById("startAll").onclick = async () => {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  snap.forEach(async d => {
    await updateDoc(doc(db, "airdropCampaigns", d.id), {
      status: "running"
    });
  });

  alert("All airdrops started");
  loadAirdrops();
};

// ================= MASTER STOP =================
document.getElementById("stopAll").onclick = async () => {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  snap.forEach(async d => {
    await updateDoc(doc(db, "airdropCampaigns", d.id), {
      status: "stopped"
    });
  });

  alert("All airdrops stopped");
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

    const card = `
      <div class="item">
        <b>${x.name}</b><br>
        Rate: ${x.rate}<br>
        Price: $${x.price}<br>
        Creator: ${x.creator}<br>
        Start: ${new Date(x.startTime).toLocaleString()}<br>
        End: ${new Date(x.endTime).toLocaleString()}<br>
        Status: ${x.status}<br>
        <button onclick="toggle('${d.id}','${x.status}')">
          Toggle
        </button>
      </div>
    `;

    if (x.status === "running") {
      active.innerHTML += card;
    } else {
      ended.innerHTML += card;
    }
  });
}

// ================= TOGGLE SINGLE =================
window.toggle = async (id, status) => {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    status: status === "running" ? "stopped" : "running"
  });

  loadAirdrops();
};

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

loadAirdrops();
loadWithdrawals();