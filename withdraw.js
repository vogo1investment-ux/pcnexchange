import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const withdrawTypeSelect = document.getElementById("withdrawTypeSelect");
const coinListDiv = document.getElementById("coinList");
const submitBtn = document.getElementById("submitWithdraw");
const withdrawAmountInput = document.getElementById("withdrawAmount");
const recipientInput = document.getElementById("recipient");
const methodSelect = document.getElementById("methodSelect");
const regionSelect = document.getElementById("regionSelect");

let userUid = null;

// Populate coins and balances
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login");
    return;
  }
  userUid = user.uid;

  const userDoc = await getDoc(doc(db, "users", userUid));
  if (!userDoc.exists()) return;

  const data = userDoc.data();
  const coins = data.coins || {};
  const referrals = data.referralBalance || {};
  const airdrops = data.airdropBalance || {};

  // Clear previous
  withdrawTypeSelect.innerHTML = `<option value="">Select type</option>`;
  coinListDiv.innerHTML = "";

  // Coins
  for (const [coinName, balance] of Object.entries(coins)) {
    const option = document.createElement("option");
    option.value = `coin-${coinName}`;
    option.textContent = `${coinName} (Balance: ${balance})`;
    withdrawTypeSelect.appendChild(option);

    const div = document.createElement("div");
    div.textContent = `${coinName}: ${balance}`;
    coinListDiv.appendChild(div);
  }

  // Referral
  for (const [coinName, balance] of Object.entries(referrals)) {
    const option = document.createElement("option");
    option.value = `ref-${coinName}`;
    option.textContent = `Referral ${coinName} (Balance: ${balance})`;
    withdrawTypeSelect.appendChild(option);

    const div = document.createElement("div");
    div.textContent = `Referral ${coinName}: ${balance}`;
    coinListDiv.appendChild(div);
  }

  // Airdrops
  for (const [coinName, balance] of Object.entries(airdrops)) {
    const option = document.createElement("option");
    option.value = `airdrop-${coinName}`;
    option.textContent = `Airdrop ${coinName} (Balance: ${balance})`;
    withdrawTypeSelect.appendChild(option);

    const div = document.createElement("div");
    div.textContent = `Airdrop ${coinName}: ${balance}`;
    coinListDiv.appendChild(div);
  }
});

// Submit withdrawal request
submitBtn.addEventListener("click", async () => {
  const withdrawType = withdrawTypeSelect.value;
  const amount = Number(withdrawAmountInput.value);
  const recipient = recipientInput.value;
  const method = methodSelect.value;
  const region = regionSelect.value;

  if (!withdrawType || !amount || !recipient || !method || !region) {
    alert("Please fill in all fields");
    return;
  }

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      userId: userUid,
      type: "withdraw",
      withdrawType,
      amount,
      recipient,
      method,
      region,
      status: "Pending",
      timestamp: new Date()
    });
    alert("Withdrawal submitted for approval!");
    withdrawAmountInput.value = "";
    recipientInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to submit withdrawal.");
  }
});