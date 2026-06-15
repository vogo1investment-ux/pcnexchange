import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot
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
const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("list");

// ---------------- STATE ----------------
let uid;
let balance = 0;
let miningIntervals = {};

// ---------------- FORMAT ----------------
function format(num) {
  return Number(num).toFixed(8);
}

// ---------------- AUTH ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { balance: 0 });
  } else {
    balance = snap.data().balance || 0;
  }

  updateBalance();

  // realtime balance
  onSnapshot(ref, (docSnap) => {
    const data = docSnap.data();
    balance = data?.balance || 0;
    balanceEl.textContent = format(balance);
  });
});

// ---------------- UPDATE BALANCE ----------------
async function updateBalance() {
  balanceEl.textContent = format(balance);

  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    balance: balance
  });
}

// ---------------- FIX: SEARCH AIRDROP BUTTON ----------------
window.loadAirdrops = async function () {
  try {
    listEl.innerHTML = "<p>🔄 Loading airdrops...</p>";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      listEl.innerHTML = "<p>❌ No airdrops found</p>";
      return;
    }

    listEl.innerHTML = "";

    snap.forEach((d) => {
      const data = d.data();

      // FIX TIMESTAMP (works for Firestore OR normal number)
      const start = data.startTime?.toDate
        ? data.startTime.toDate()
        : new Date(data.startTime);

      const end = data.endTime?.toDate
        ? data.endTime.toDate()
        : new Date(data.endTime);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="title">🚀 ${data.name || "Airdrop"}</div>

        <div class="row">📅 Start: ${start.toLocaleString()}</div>
        <div class="row">📅 End: ${end.toLocaleString()}</div>
        <div class="row">⚡ Rate: ${data.rate || 0.00000001} / sec</div>

        <div class="mineRow">
          <button class="mineBtn" id="mine-${d.id}">
            ▶ Start Mining
          </button>
        </div>

        <div class="mineRow">
          <button class="mineBtn" style="background:#ffcc00"
            onclick="withdraw('${d.id}')">
            💸 Withdraw
          </button>
        </div>
      `;

      listEl.appendChild(card);

      const btn = card.querySelector(`#mine-${d.id}`);

      btn.onclick = () =>
        startMining(
          d.id,
          Number(data.rate || 0.00000001),
          end.getTime(),
          btn
        );
    });
  } catch (e) {
    console.error(e);
    listEl.innerHTML = "<p>❌ Failed to load airdrops</p>";
  }
};

// ---------------- FIX: MINING ENGINE ----------------
function startMining(id, rate, endTime, btn) {
  if (miningIntervals[id]) return;

  btn.innerText = "⛏ Mining...";

  miningIntervals[id] = setInterval(async () => {
    const now = Date.now();

    if (now >= endTime) {
      clearInterval(miningIntervals[id]);
      delete miningIntervals[id];
      btn.innerText = "⛔ Ended";
      return;
    }

    balance += rate;

    await updateBalance();
  }, 1000);
}

// ---------------- WITHDRAW ----------------
window.withdraw = async function (airdropId) {
  if (balance <= 0) {
    alert("No balance to withdraw");
    return;
  }

  try {
    await setDoc(doc(db, "pendingWithdrawals", uid + "_" + airdropId), {
      userId: uid,
      airdropId: airdropId,
      amount: balance,
      status: "pending",
      createdAt: new Date()
    });

    alert("✅ Withdrawal sent to admin");

  } catch (e) {
    console.error(e);
    alert("❌ Withdrawal failed");
  }
};