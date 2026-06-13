import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
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

let uid = null;

const balanceBox = document.getElementById("balanceBox");
const list = document.getElementById("airdropList");
const btn = document.getElementById("loadAirdropsBtn");

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;
  loadBalance();
});

// ---------------- BALANCE ----------------
async function loadBalance() {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const data = snap.exists() ? snap.data() : {};

  balanceBox.innerHTML = `💰 Balance: ${data.airdropBalance || 0}`;
}

// ---------------- LOAD AIRDROPS ----------------
btn.onclick = async () => {
  list.innerHTML = "Loading airdrops...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      list.innerHTML = "No airdrops available";
      return;
    }

    list.innerHTML = "";

    snap.forEach((docItem) => {
      const d = docItem.data();

      list.innerHTML += `
        <div class="card">
          🚀 <b>${d.name}</b>
          <div class="status">${d.status || "active"}</div>

          <p>💰 Price: ${d.price}</p>
          <p>⚡ Rate: ${d.rate}</p>
          <p>📅 Start: ${new Date(d.startTime).toLocaleString()}</p>
          <p>📅 End: ${new Date(d.endTime).toLocaleString()}</p>

          <button onclick="startAirdrop('${docItem.id}', ${d.rate}, ${d.endTime})">
            Start Airdrop
          </button>
        </div>
      `;
    });

  } catch (e) {
    console.log(e);
    list.innerHTML = "❌ Failed to load airdrops";
  }
};

// ---------------- START AIRDROP ----------------
window.startAirdrop = async (id, rate, endTime) => {

  const userRef = doc(db, "users", uid);
  const stateRef = doc(db, "users", uid, "airdropState", id);

  const snap = await getDoc(stateRef);

  if (!snap.exists()) {
    await setDoc(stateRef, {
      mined: 0,
      rate,
      endTime,
      active: true
    });
  }

  alert("Airdrop started!");

  const interval = setInterval(async () => {

    const s = await getDoc(stateRef);
    if (!s.exists()) return clearInterval(interval);

    const data = s.data();

    if (Date.now() > data.endTime) {
      clearInterval(interval);
      alert("Airdrop ended");
      return;
    }

    const add = data.rate / 10;
    const newAmount = (data.mined || 0) + add;

    await updateDoc(stateRef, { mined: newAmount });
    await updateDoc(userRef, { airdropBalance: newAmount });

    loadBalance();

  }, 3000);
};