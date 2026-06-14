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

/* ================= SAFE INIT ================= */
window.onload = () => {
  console.log("Airdrop Admin Loaded 🚀");
  loadAirdrops();
};

/* ================= CREATE AIRDROP ================= */
window.createAirdrop = async function () {
  try {
    const nameEl = document.getElementById("name");
    const rateEl = document.getElementById("rate");
    const priceEl = document.getElementById("price");
    const startEl = document.getElementById("start");
    const endEl = document.getElementById("end");

    if (!nameEl || !rateEl || !priceEl || !startEl || !endEl) {
      alert("Missing input fields in HTML");
      return;
    }

    await addDoc(collection(db, "airdropCampaigns"), {
      name: nameEl.value,
      rate: Number(rateEl.value || 0.00000001),
      price: Number(priceEl.value || 0),
      startTime: new Date(startEl.value).getTime(),
      endTime: new Date(endEl.value).getTime(),
      active: true,
      createdAt: serverTimestamp()
    });

    alert("Airdrop Created 🚀");
    loadAirdrops();

  } catch (err) {
    console.error(err);
    alert("Create failed — check console");
  }
};

/* ================= LOAD AIRDROPS ================= */
async function loadAirdrops() {
  const box = document.getElementById("airdrops");
  if (!box) return;

  box.innerHTML = "Loading airdrops...";

  try {
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

  } catch (err) {
    console.error(err);
    box.innerHTML = "❌ Failed to load airdrops";
  }
}

/* ================= START / STOP ================= */
window.startAirdrop = async function(id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    active: true
  });
  loadAirdrops();
};

window.stopAirdrop = async function(id) {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    active: false
  });
  loadAirdrops();
};