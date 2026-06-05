import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

let currentUser;

const coinListDiv = document.getElementById("coinList");
const withdrawAmountInput = document.getElementById("withdrawAmount");
const recipientInput = document.getElementById("recipient");
const regionSelect = document.getElementById("regionSelect");
const methodSelect = document.getElementById("methodSelect");
const submitWithdrawBtn = document.getElementById("submitWithdraw");

onAuthStateChanged(auth, async user => {
  if (!user) return alert("Login required");
  currentUser = user;
  await loadUserCoins();
});

// Load coins, referral, airdrops
async function loadUserCoins() {
  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return coinListDiv.innerHTML = "No user data";

    const userData = userSnap.data();
    const coins = userData.coins || [];
    const referral = userData.referralCommission || 0;
    const airdrop = userData.airdrop || 0;

    let html = `<div class="p-2 border-b border-zinc-700">
      <strong>Referral Commission:</strong> $${referral}<br>
      <strong>Airdrop:</strong> $${airdrop}
    </div>`;

    coins.forEach(c => {
      html += `
      <div class="p-2 border-b border-zinc-700">
        <div class="flex justify-between items-center mb-2">
          <span>${c.name}: ${c.balance}</span>
        </div>
        <input type="number" placeholder="Amount to withdraw" class="withdrawAmountCoin w-full p-2 rounded bg-black border border-zinc-700 mb-2">
        <input type="text" placeholder="Enter your account / wallet info" class="withdrawDetailsCoin w-full p-2 rounded bg-black border border-zinc-700 mb-2">
        <button class="withdrawCoinBtn bg-emerald-400 text-black p-2 rounded w-full font-bold" data-coin="${c.name}">Withdraw ${c.name}</button>
      </div>`;
    });

    coinListDiv.innerHTML = html;

    // Attach withdraw click listeners
    coinListDiv.querySelectorAll(".withdrawCoinBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const coinName = e.target.dataset.coin;
        const container = e.target.parentElement;
        const amountInput = container.querySelector(".withdrawAmountCoin");
        const detailsInput = container.querySelector(".withdrawDetailsCoin");

        const amount = parseFloat(amountInput.value);
        const details = detailsInput.value.trim();

        if (!amount || !details) return alert("Enter both amount and withdrawal details");

        await addDoc(collection(db, "pendingTransactions"), {
          userId: currentUser.uid,
          type: "withdraw-coin",
          coin: coinName,
          amount,
          details,
          status: "Pending",
          createdAt: serverTimestamp()
        });

        alert(`${coinName} withdrawal request submitted`);
        amountInput.value = "";
        detailsInput.value = "";
      });
    });

  } catch (err) {
    console.error(err);
    coinListDiv.innerHTML = "Failed to load coins";
  }
}

// Submit traditional withdrawal (region/method)
submitWithdrawBtn.addEventListener("click", async () => {
  const amount = parseFloat(withdrawAmountInput.value);
  const recipient = recipientInput.value.trim();
  const region = regionSelect.value;
  const method = methodSelect.value;

  if (!amount || !recipient || !region || !method) return alert("Fill all fields");

  await addDoc(collection(db, "pendingTransactions"), {
    userId: currentUser.uid,
    type: "withdraw",
    amount,
    recipient,
    region,
    method,
    status: "Pending",
    createdAt: serverTimestamp()
  });

  alert("Withdrawal request submitted");
  withdrawAmountInput.value = "";
  recipientInput.value = "";
  regionSelect.value = "";
  methodSelect.value = "";
});