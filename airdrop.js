import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
});

const db = getFirestore(app);
const auth = getAuth(app);

const list = document.getElementById("airdropList");
const balanceBox = document.getElementById("totalBalance");

let uid;

/* ---------------- AUTH ---------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) return (location.href = "login.html");
  uid = user.uid;
  loadAirdrops();
});

/* ---------------- LOAD AIRDROPS ---------------- */
function loadAirdrops() {
  onSnapshot(collection(db, "airdropCampaigns"), (snap) => {

    list.innerHTML = "";

    snap.forEach((docSnap) => {
      const d = docSnap.data();

      list.innerHTML += `
        <div class="card">
          🚀 <b>${d.name}</b><br>
          💰 Rate: ${d.rate}<br>
          📅 Start: ${new Date(d.startTime).toLocaleString()}<br>
          📅 End: ${new Date(d.endTime).toLocaleString()}<br>

          <button onclick="startAirdrop('${docSnap.id}', ${d.rate})"
          style="width:100%;padding:10px;background:#22c55e;border:none">
            START AIRDROP
          </button>
        </div>
      `;
    });
  });
}

/* ---------------- START AIRDROP ---------------- */
window.startAirdrop = async (id, rate) => {

  const ref = doc(db, "airdropUsers", uid, "activeAirdrops", id);

  const snap = await getDoc(ref);

  let currentBalance = snap.exists() ? snap.data().balance : 0;

  await setDoc(ref, {
    balance: currentBalance,
    rate,
    lastUpdate: Date.now()
  });

  alert("Airdrop Started 🚀");

  runMining(id);
};

/* ---------------- REAL MINING ---------------- */
function runMining(id) {

  const ref = doc(db, "airdropUsers", uid, "activeAirdrops", id);

  setInterval(async () => {

    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    let data = snap.data();

    let newBalance = Number(data.balance || 0) + Number(data.rate || 0);

    await updateDoc(ref, {
      balance: newBalance,
      lastUpdate: Date.now()
    });

    balanceBox.innerText = newBalance.toFixed(6);

  }, 3000);
}