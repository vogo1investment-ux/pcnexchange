import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "...",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId;
let coinsData = {};
let withdrawTypeSelect = document.getElementById("withdrawTypeSelect");
let coinListDiv = document.getElementById("coinList");

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "login.html";
  userId = user.uid;
  await loadUserBalances();
});

async function loadUserBalances() {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  coinsData = userData.coins || {};
  const withdrawableBalance = userData.withdrawableBalance || 0;

  // Populate withdrawal type dropdown
  withdrawTypeSelect.innerHTML = `<option value="">Select type</option>`;
  if (withdrawableBalance > 0)
    withdrawTypeSelect.innerHTML += `<option value="withdrawable">Withdrawable Balance: $${withdrawableBalance}</option>`;
  if (userData.referralCommission && userData.referralCommission > 0)
    withdrawTypeSelect.innerHTML += `<option value="referral">Referral Commission: $${userData.referralCommission}</option>`;
  if (userData.airdrop && userData.airdrop > 0)
    withdrawTypeSelect.innerHTML += `<option value="airdrop">Airdrop: $${userData.airdrop}</option>`;
  Object.keys(coinsData).forEach(coin => {
    withdrawTypeSelect.innerHTML += `<option value="${coin}">${coin} Balance: ${coinsData[coin]}</option>`;
  });

  // Show coin balances in UI
  coinListDiv.innerHTML = "";
  if (withdrawableBalance > 0) {
    const div = document.createElement("div");
    div.className = "p-2 bg-black border border-green-500 rounded";
    div.innerText = `Withdrawable Balance: $${withdrawableBalance}`;
    coinListDiv.appendChild(div);
  }
  Object.entries(coinsData).forEach(([coin, amount]) => {
    const div = document.createElement("div");
    div.className = "p-2 bg-black border border-green-500 rounded";
    div.innerText = `${coin}: ${amount}`;
    coinListDiv.appendChild(div);
  });
  if (userData.referralCommission) {
    const div = document.createElement("div");
    div.className = "p-2 bg-black border border-green-500 rounded";
    div.innerText = `Referral Commission: $${userData.referralCommission}`;
    coinListDiv.appendChild(div);
  }
  if (userData.airdrop) {
    const div = document.createElement("div");
    div.className = "p-2 bg-black border border-green-500 rounded";
    div.innerText = `Airdrop: $${userData.airdrop}`;
    coinListDiv.appendChild(div);
  }
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