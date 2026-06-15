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

// ---------------- CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- ELEMENTS ----------------
const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("list");

let uid = null;
let balance = 0;
let authReady = false;

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    listEl.innerHTML = "❌ Not logged in";
    return;
  }

  uid = user.uid;
  authReady = true;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { balance: 0 });
  } else {
    balance = snap.data().balance || 0;
  }

  balanceEl.innerText = balance.toFixed(8);
});

// ---------------- LOAD AIRDROPS ----------------
window.loadAirdrops = async function () {

  if (!authReady) {
    listEl.innerHTML = "⏳ Please wait for login...";
    return;
  }

  listEl.innerHTML = "Loading airdrops...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      listEl.innerHTML = "❌ No airdrops found in Firestore";
      return;
    }

    listEl.innerHTML = "";

    snap.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>🚀 ${data.name || "Airdrop"}</h3>
        <p>⚡ Rate: ${data.rate || 0.00000001}</p>
        <p>📅 Start: ${new Date(data.startTime).toLocaleString()}</p>
        <p>📅 End: ${new Date(data.endTime).toLocaleString()}</p>

        <button onclick="startMining('${docSnap.id}', ${data.rate || 0.00000001}, ${data.endTime})">
          ▶ Start Mining
        </button>
      `;

      listEl.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    listEl.innerHTML = "❌ Error loading airdrops (check Firestore rules or collection name)";
  }
};

// ---------------- MINING ----------------
window.startMining = function (id, rate, endTime) {

  const interval = setInterval(async () => {

    if (Date.now() > endTime) {
      clearInterval(interval);
      alert("Airdrop ended");
      return;
    }

    balance += rate;
    balanceEl.innerText = balance.toFixed(8);

    if (uid) {
      await updateDoc(doc(db, "users", uid), {
        balance: balance
      });
    }

  }, 1000);
};

// ---------------- WITHDRAW BUTTON ----------------
window.goWithdraw = function () {
  window.location.href = "WithdrawAirdrop.html";
};