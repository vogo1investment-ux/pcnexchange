import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc
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
const totalBalance = document.getElementById("totalBalance");

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  uid = user.uid;

  listenAirdrops();   // REAL TIME FIX
  listenBalance();
});

/* ================= REAL TIME AIRDROPS ================= */
function listenAirdrops() {

  onSnapshot(collection(db, "airdropCampaigns"), (snap) => {

    list.innerHTML = "";

    snap.forEach((d) => {
      const x = d.data();

      list.innerHTML += `
        <div class="card">
          🌟 <b>${x.name}</b><br>

          ⚡ Rate: ${x.rate}<br>
          💰 Price: $${x.price}<br>

          🚀 Start: ${new Date(x.startTime).toLocaleString()}<br>
          ⏳ End: ${new Date(x.endTime).toLocaleString()}<br>

          📊 Status: ${x.status}<br>

          <button onclick="startMining('${d.id}', ${x.rate})"
            style="background:#22c55e;color:black;padding:8px;width:100%">
            🚀 Start Mining
          </button>
        </div>
      `;
    });

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
      rate,
      isMining: true
    });
  }

  setInterval(async () => {

    const s = await getDoc(ref);
    if (!s.exists()) return;

    const data = s.data();
    if (!data.isMining) return;

    await updateDoc(ref, {
      balance: (data.balance || 0) + rate
    });

  }, 1000);
};

/* ================= TOTAL BALANCE ================= */
function listenBalance() {

  setInterval(async () => {

    const snap = await getDocs(collection(db, "userAirdrops"));

    let total = 0;

    snap.forEach((d) => {
      const x = d.data();
      if (x.uid === uid) {
        total += x.balance || 0;
      }
    });

    totalBalance.innerText = total.toFixed(6);

  }, 2000);
}