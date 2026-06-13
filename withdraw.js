import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { 
  getFirestore, doc, collection, addDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

let userId;
let userDataGlobal = null;

const withdrawTypeSelect = document.getElementById("withdrawTypeSelect");
const coinListDiv = document.getElementById("coinList");

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";
  userId = user.uid;
  await loadUserBalances();
});


// =====================
// LOAD BALANCES (FIXED)
// =====================
async function loadUserBalances() {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  userDataGlobal = userData;

  const coinsData = userData.coins || {};

  withdrawTypeSelect.innerHTML = `<option value="">Select type</option>`;

  if (userData.withdrawableBalance > 0) {
    withdrawTypeSelect.innerHTML += `<option value="withdrawable">Withdrawable Balance</option>`;
  }

  if (userData.referralCommission > 0) {
    withdrawTypeSelect.innerHTML += `<option value="referral">Referral Commission</option>`;
  }

  if (userData.airdrop > 0) {
    withdrawTypeSelect.innerHTML += `<option value="airdrop">Airdrop Balance</option>`;
  }

  Object.keys(coinsData).forEach(coin => {
    withdrawTypeSelect.innerHTML += `<option value="${coin}">${coin}</option>`;
  });

  // UI display
  coinListDiv.innerHTML = `
    <div class="p-2 bg-black border border-green-500 rounded">
      Withdrawable: $${userData.withdrawableBalance || 0}
    </div>
    <div class="p-2 bg-black border border-green-500 rounded">
      Referral: $${userData.referralCommission || 0}
    </div>
    <div class="p-2 bg-black border border-green-500 rounded">
      Airdrop: $${userData.airdrop || 0}
    </div>
  `;

  Object.entries(coinsData).forEach(([coin, amount]) => {
    coinListDiv.innerHTML += `
      <div class="p-2 bg-black border border-green-500 rounded">
        ${coin}: ${amount}
      </div>
    `;
  });
}


// =====================
// WITHDRAW SUBMIT (FIXED)
// =====================
document.getElementById("submitWithdraw").addEventListener("click", async () => {
  const region = document.getElementById("regionSelect").value;
  const type = withdrawTypeSelect.value;
  const method = document.getElementById("methodSelect").value;
  const amount = Number(document.getElementById("withdrawAmount").value);
  const recipient = document.getElementById("recipient").value;

  if (!region || !type || !method || !amount || !recipient) {
    return alert("Fill all fields");
  }

  if (!userDataGlobal) return alert("User data not loaded");

  // 🔥 BALANCE CHECK FIX
  let available = 0;

  if (type === "withdrawable") {
    available = userDataGlobal.withdrawableBalance || 0;
  } else if (type === "referral") {
    available = userDataGlobal.referralCommission || 0;
  } else if (type === "airdrop") {
    available = userDataGlobal.airdrop || 0;
  } else {
    available = userDataGlobal.coins?.[type] || 0;
  }

  if (amount > available) {
    return alert("Insufficient balance");
  }

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      userId,
      region,
      type,
      method,
      amount,
      recipient,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Withdrawal submitted successfully!");

    document.getElementById("withdrawAmount").value = "";
    document.getElementById("recipient").value = "";

  } catch (err) {
    console.error(err);
    alert("Failed to submit withdrawal");
  }
});