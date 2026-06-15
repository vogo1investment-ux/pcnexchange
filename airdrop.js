import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const list = document.getElementById("list");

let user = null;

onAuthStateChanged(auth, (u) => {
  user = u;
});


// ---------------- LOAD AIRDROPS ----------------
window.loadAirdrops = async function () {
  try {
    list.innerHTML = "Loading airdrops...";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      list.innerHTML = "❌ No airdrops available";
      return;
    }

    list.innerHTML = "";

    snap.forEach(docSnap => {
      const d = docSnap.data();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>🚀 ${d.name || "Airdrop"}</h3>
        <p>⚡ Rate: ${d.rate}</p>
        <p>📅 Status: ${d.status || "active"}</p>

        <button class="withdrawBtn" onclick="withdraw('${docSnap.id}', '${d.name}')">
          💸 Withdraw This Airdrop
        </button>
      `;

      list.appendChild(div);
    });

  } catch (err) {
    console.log(err);
    list.innerHTML = "❌ Error loading airdrops (check Firestore rules)";
  }
};


// ---------------- WITHDRAW FUNCTION ----------------
window.withdraw = async function (airdropId, name) {

  if (!user) {
    alert("Please login first");
    return;
  }

  try {
    await addDoc(collection(db, "withdrawalairdrop"), {
      userId: user.uid,
      airdropId,
      airdropName: name,
      status: "pending",
      createdAt: Date.now()
    });

    alert("✅ Withdrawal request sent");

  } catch (e) {
    console.log(e);
    alert("❌ Withdrawal failed");
  }
};


// ---------------- GO WITHDRAW PAGE ----------------
window.goWithdrawPage = function () {
  window.location.href = "withdraw-airdrop.html";
};