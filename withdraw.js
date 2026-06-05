import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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
let userData = {};
const withdrawTypeSelect = document.getElementById("withdrawTypeSelect");
const coinListDiv = document.getElementById("coinList");

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "login.html";
  userId = user.uid;
  await loadBalances();
});

async function loadBalances() {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  userData = snap.data();

  const coins = userData.coins || {};
  const withdrawable = userData.withdrawableBalance || {};
  const airdrop = userData.airdrop || 0;
  const airdropWithdrawable = userData.airdropWithdrawable || 0;
  const referral = userData.referralCommission || 0;
  const referralWithdrawable = userData.referralWithdrawable || 0;
  const totalWithdrawable = userData.totalWithdrawable || 0;

  // Populate dropdown
  withdrawTypeSelect.innerHTML = `<option value="">Select type</option>`;
  withdrawTypeSelect.innerHTML += `<option value="withdrawableBalance">Withdrawable Balance: $${totalWithdrawable}</option>`;
  withdrawTypeSelect.innerHTML += `<option value="referral">Referral: $${referral} | Withdrawable: $${referralWithdrawable}</option>`;
  withdrawTypeSelect.innerHTML += `<option value="airdrop">Airdrop: $${airdrop} | Withdrawable: $${airdropWithdrawable}</option>`;
  Object.keys(coins).forEach(coin => {
    const total = coins[coin] || 0;
    const w = withdrawable[coin] || 0;
    withdrawTypeSelect.innerHTML += `<option value="${coin}">${coin}: Total ${total} | Withdrawable ${w}</option>`;
  });

  // Display balances
  coinListDiv.innerHTML = "";
  coinListDiv.innerHTML += `<div class="p-2 bg-black border border-green-500 rounded">Withdrawable Balance: $${totalWithdrawable}</div>`;
  coinListDiv.innerHTML += `<div class="p-2 bg-black border border-green-500 rounded">Referral: ${referral} | Withdrawable: ${referralWithdrawable}</div>`;
  coinListDiv.innerHTML += `<div class="p-2 bg-black border border-green-500 rounded">Airdrop: ${airdrop} | Withdrawable: ${airdropWithdrawable}</div>`;
  Object.keys(coins).forEach(coin => {
    const total = coins[coin] || 0;
    const w = withdrawable[coin] || 0;
    coinListDiv.innerHTML += `<div class="p-2 bg-black border border-green-500 rounded">${coin}: Total ${total} | Withdrawable ${w}</div>`;
  });
}

// Submit withdrawal
document.getElementById("submitWithdraw").addEventListener("click", async () => {
  const region = document.getElementById("regionSelect").value;
  const type = withdrawTypeSelect.value;
  const method = document.getElementById("methodSelect").value;
  const amount = Number(document.getElementById("withdrawAmount").value);
  const recipient = document.getElementById("recipient").value;

  if (!region || !type || !method || !amount || !recipient) return alert("Fill all fields");

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
    alert("Withdrawal request submitted!");
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("recipient").value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to submit withdrawal");
  }
});