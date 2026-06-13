import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ---------------- FIREBASE ----------------
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

// ---------------- UI ----------------
const list = document.getElementById("airdropList");
const balanceBox = document.getElementById("balanceBox");
const searchBtn = document.getElementById("searchAirdrop");

let uid = null;

// ---------------- LOGIN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;
  await loadBalance();
});

// ---------------- LOAD BALANCE ----------------
async function loadBalance() {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const data = snap.exists() ? snap.data() : {};

  balanceBox.innerHTML = `
    💰 TOTAL BALANCE<br>
    <b style="font-size:28px">${data.airdropBalance || 0}</b>
  `;
}

// ---------------- LOAD AIRDROPS ----------------
searchBtn.onclick = async () => {
  list.innerHTML = "Loading airdrops...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      list.innerHTML = "No airdrops available";
      return;
    }

    list.innerHTML = "";

    snap.forEach((d) => {
      const data = d.data();

      list.innerHTML += `
        <div class="card">
          🚀 <b>${data.name}</b><br>
          💰 Rate: ${data.rate}<br>
          📅 Start: ${new Date(data.startTime).toLocaleString()}<br>
          📅 End: ${new Date(data.endTime).toLocaleString()}<br>

          <button onclick="startMining('${d.id}', ${data.rate}, ${data.endTime})">
            Start Airdrop
          </button>
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
    list.innerHTML = "❌ Failed to load airdrops";
  }
};

// ---------------- START MINING ----------------
window.startMining = async (airdropId, rate, endTime) => {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const stateRef = doc(db, "users", uid, "airdropState", airdropId);

  const now = Date.now();

  const stateSnap = await getDoc(stateRef);

  // if not exists, create
  if (!stateSnap.exists()) {
    await setDoc(stateRef, {
      started: true,
      mined: 0,
      rate,
      endTime,
      lastUpdate: now
    });
  }

  // start mining loop
  const interval = setInterval(async () => {
    const snap = await getDoc(stateRef);
    if (!snap.exists()) return clearInterval(interval);

    const data = snap.data();

    if (Date.now() > data.endTime) {
      clearInterval(interval);
      return;
    }

    const add = data.rate / 10;

    const newMined = (data.mined || 0) + add;

    await updateDoc(stateRef, {
      mined: newMined,
      lastUpdate: Date.now()
    });

    // update user balance
    await updateDoc(userRef, {
      airdropBalance: newMined
    });

    await loadBalance();
  }, 3000);
};