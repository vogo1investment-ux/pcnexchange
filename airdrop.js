import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
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
const list = document.getElementById("list");

/* ================= USER LOGIN ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return (location.href = "login.html");

  uid = user.uid;
  loadAirdrops();
});

/* ================= LOAD AIRDROPS ================= */
async function loadAirdrops() {

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(docSnap => {
    const d = docSnap.data();

    list.innerHTML += `
      <div class="card">
        🌟 <b>${d.name}</b><br>

        ⚡ Rate: ${d.rate}<br>
        💰 Price: $${d.price}<br>

        🚀 Start: ${new Date(d.startTime).toLocaleString()}<br>
        ⏳ End: ${new Date(d.endTime).toLocaleString()}<br>

        📊 Status: ${d.status}<br>

        <div class="balance" id="bal-${docSnap.id}">
          Balance: 0.000000
        </div>

        <button class="green" onclick="startMining('${docSnap.id}', ${d.rate})">
          🚀 Start Mining
        </button>
      </div>
    `;
  });
}

/* ================= START MINING ================= */
window.startMining = async (airdropId, rate) => {

  const ref = doc(db, "userAirdrops", `${uid}_${airdropId}`);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      airdropId,
      balance: 0,
      isMining: true,
      lastUpdate: Date.now()
    });
  }

  setInterval(async () => {

    const s = await getDoc(ref);
    if (!s.exists()) return;

    const data = s.data();
    if (!data.isMining) return;

    const newBal = data.balance + rate;

    await updateDoc(ref, {
      balance: newBal,
      lastUpdate: Date.now()
    });

    document.getElementById(`bal-${airdropId}`).innerText =
      "Balance: " + newBal.toFixed(6);

  }, 1000);
};