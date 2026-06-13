import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
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

/* ================= CREATE AIRDROP ================= */
document.getElementById("createBtn").onclick = async () => {

  const name = document.getElementById("name").value;
  const rate = Number(document.getElementById("rate").value);
  const price = Number(document.getElementById("price").value);
  const duration = Number(document.getElementById("duration").value);

  const startTime = Date.now();
  const endTime = startTime + duration * 60000;

  await addDoc(collection(db, "airdropCampaigns"), {
    name,
    rate,
    price,
    creator: ADMIN_UID,
    startTime,
    endTime,
    status: "stopped"
  });

  loadAirdrops();
};

/* ================= START ONE ================= */
window.startOne = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    status: "running",
    startTime: Date.now()
  });

  loadAirdrops();
};

/* ================= STOP ONE ================= */
window.stopOne = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    status: "stopped",
    endTime: Date.now()
  });

  loadAirdrops();
};

/* ================= LOAD AIRDROPS ================= */
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
        🌟 <b>${x.name}</b><br>

        ⚡ Rate: ${x.rate}<br>
        💰 Price: $${x.price}<br>
        👤 Creator: ${x.creator}<br>

        🚀 Start: ${new Date(x.startTime).toLocaleString()}<br>
        ⏳ End: ${new Date(x.endTime).toLocaleString()}<br>

        📊 Status: ${x.status}<br>

        <button onclick="startOne('${d.id}')" class="green">
          🚀 Start Airdrop
        </button>

        <button onclick="stopOne('${d.id}')" class="red">
          ⛔ Stop Airdrop
        </button>
      </div>
    `;

    if (x.status === "running") active.innerHTML += html;
    else ended.innerHTML += html;
  });
}

/* INIT */
loadAirdrops();