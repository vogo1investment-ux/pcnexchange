import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
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

let uid = null;

// DOM
const listEl = document.getElementById("airdropList");
const withdrawalEl = document.getElementById("withdrawals");

// ---------------- AUTH SAFE GUARD ----------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("Not logged in yet");
    return;
  }

  uid = user.uid;
  console.log("Logged in:", uid);
});

// ---------------- LOAD AIRDROPS (FIXED) ----------------
window.loadAirdrops = async function () {
  try {
    if (!uid) {
      alert("Login not ready yet. Please wait...");
      return;
    }

    listEl.innerHTML = "Loading...";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    listEl.innerHTML = "";

    if (snap.empty) {
      listEl.innerHTML = "No airdrops found";
      return;
    }

    snap.forEach((d) => {
      const data = d.data();

      const div = document.createElement("div");
      div.className = "box";

      div.innerHTML = `
        <h3>🚀 ${data.name}</h3>
        <p>💰 Rate: ${data.rate}</p>
        <p>📅 Start: ${new Date(data.startTime).toLocaleString()}</p>
        <p>⛔ End: ${new Date(data.endTime).toLocaleString()}</p>

        <button onclick="startMining('${d.id}', ${data.rate})">
          ▶ Start Mining
        </button>

        <button onclick="withdraw('${d.id}')">
          💸 Withdraw
        </button>
      `;

      listEl.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    listEl.innerHTML = "❌ Failed: " + err.message;
  }
};

// ---------------- CREATE WITHDRAWAL BATCH ----------------
window.createWithdrawalBatch = async function () {
  try {
    const ref = doc(collection(db, "airdropWithdrawals"));

    await setDoc(ref, {
      createdAt: Date.now(),
      status: "open",
      createdBy: uid
    });

    alert("✅ Withdrawal batch created");
  } catch (e) {
    alert(e.message);
  }
};

// ---------------- FETCH WITHDRAWALS ----------------
window.fetchWithdrawals = async function () {
  try {
    withdrawalEl.innerHTML = "Loading withdrawals...";

    const snap = await getDocs(collection(db, "pendingWithdrawals"));

    withdrawalEl.innerHTML = "";

    snap.forEach((d) => {
      const w = d.data();

      const div = document.createElement("div");
      div.className = "box";

      div.innerHTML = `
        <p>👤 User: ${w.userId}</p>
        <p>💰 Amount: ${w.amount}</p>
        <p>📌 Status: ${w.status}</p>

        <button onclick="approveWithdraw('${d.id}', '${w.userId}', ${w.amount})">
          ✅ Approve
        </button>

        <button onclick="rejectWithdraw('${d.id}', '${w.userId}', ${w.amount})">
          ❌ Reject
        </button>
      `;

      withdrawalEl.appendChild(div);
    });

  } catch (e) {
    alert("Fetch error: " + e.message);
  }
};

// ---------------- APPROVE ----------------
window.approveWithdraw = async function (id, userId, amount) {
  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "approved"
  });

  alert("Approved");
};

// ---------------- REJECT ----------------
window.rejectWithdraw = async function (id, userId, amount) {
  await updateDoc(doc(db, "pendingWithdrawals", id), {
    status: "rejected"
  });

  alert("Rejected");
};

// ---------------- WITHDRAW REQUEST (USER SIDE) ----------------
window.withdraw = async function (airdropId) {
  try {
    if (!uid) return alert("Login first");

    await addDoc(collection(db, "pendingWithdrawals"), {
      userId: uid,
      airdropId,
      amount: 0,
      status: "pending",
      createdAt: Date.now()
    });

    alert("✅ Withdrawal sent to admin");
  } catch (e) {
    alert(e.message);
  }
};