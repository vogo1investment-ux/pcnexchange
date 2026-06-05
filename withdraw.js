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
const withdrawTypeSelect = document.getElementById("withdrawTypeSelect");
const submitWithdrawBtn = document.getElementById("submitWithdraw");

onAuthStateChanged(auth, async user => {
  if (!user) return alert("Login required");
  currentUser = user;
  await loadUserCoins();
});

async function loadUserCoins() {
  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return coinListDiv.innerHTML = "No user data";

    const userData = userSnap.data();
    const coins = userData.coins || [];
    const referral = userData.referralCommission || 0;
    const airdrop = userData.airdrop || 0;

    // Show all coins, airdrop, referral
    let html = `<div class="p-2 border-b border-zinc-700">
      <strong>Referral Commission:</strong> $${referral}<br>
      <strong>Airdrop:</strong> $${airdrop}
    </div>`;

    coins.forEach(c => {
      html += `<div class="p-2 border-b border-zinc-700">
        <strong>${c.name}:</strong> ${c.balance}
      </div>`;

      // Add each coin to the withdrawal type dropdown if not already there
      const exists = Array.from(withdrawTypeSelect.options).some(opt => opt.value === c.name);
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.innerText = c.name;
        withdrawTypeSelect.appendChild(opt);
      }
    });

    coinListDiv.innerHTML = html;

  } catch (err) {
    console.error(err);
    coinListDiv.innerHTML = "Failed to load coins";
  }
}

// Submit withdrawal
submitWithdrawBtn.addEventListener("click", async () => {
  const amount = parseFloat(withdrawAmountInput.value);
  const recipient = recipientInput.value.trim();
  const region = regionSelect.value;
  const method = methodSelect.value;
  const type = withdrawTypeSelect.value;

  if (!amount || !recipient || !region || !method || !type) return alert("Fill all fields");

  await addDoc(collection(db, "pendingTransactions"), {
    userId: currentUser.uid,
    type: type === "airdrop" ? "withdraw-airdrop" : "withdraw-coin",
    coin: type !== "airdrop" ? type : null,
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
  withdrawTypeSelect.value = "";
});