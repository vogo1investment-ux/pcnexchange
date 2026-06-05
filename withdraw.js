import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config (same as your app)
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

const coinListDiv = document.getElementById("coinList");
const submitWithdrawBtn = document.getElementById("submitWithdraw");

let currentUser;

onAuthStateChanged(auth, user => {
  if (!user) return alert("Login required");
  currentUser = user;
  loadUserCoins();
});

// --- Display user coins, referral commissions, airdrops ---
async function loadUserCoins() {
  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDocs(collection(db, "users"));
    // You can also fetch individual fields from user doc
    const userDoc = userSnap.docs.find(d => d.id === currentUser.uid)?.data();

    if (!userDoc) return coinListDiv.innerHTML = "No user data";

    // Example coins array in user doc: [{name:"BTC", balance:1.2}, {name:"ETH", balance:0.5}]
    const coins = userDoc.coins || [];
    const referral = userDoc.referralCommission || 0;
    const airdrop = userDoc.airdrop || 0;

    let html = `<div class="p-2 border-b border-zinc-700">
      <strong>Referral Commission:</strong> $${referral}<br>
      <strong>Airdrop:</strong> $${airdrop}
    </div>`;

    coins.forEach(c => {
      html += `<div class="p-2 border-b border-zinc-700 flex justify-between items-center">
        <span>${c.name}: ${c.balance}</span>
        <button class="withdrawCoinBtn bg-emerald-400 text-black p-1 rounded" data-coin="${c.name}">Withdraw</button>
      </div>`;
    });

    coinListDiv.innerHTML = html;

    // Attach click listeners
    coinListDiv.querySelectorAll(".withdrawCoinBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const coinName = e.target.dataset.coin;
        const amount = prompt(`Enter amount to withdraw for ${coinName}:`);
        if (!amount) return;

        // Add withdrawal request to Firestore
        await addDoc(collection(db, "pendingTransactions"), {
          userId: currentUser.uid,
          type: "withdraw",
          coin: coinName,
          amount: parseFloat(amount),
          status: "Pending",
          createdAt: serverTimestamp()
        });
        alert(`Withdrawal request for ${coinName} submitted`);
      });
    });

  } catch (err) {
    console.error(err);
    coinListDiv.innerHTML = "Failed to load coins";
  }
}

// --- Optional: regular withdrawal form ---
submitWithdrawBtn.addEventListener("click", async () => {
  const region = document.getElementById("regionSelect").value;
  const method = document.getElementById("methodSelect").value;
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const recipient = document.getElementById("recipient").value;

  if (!region || !method || !amount || !recipient) return alert("Fill all fields");

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      userId: currentUser.uid,
      type: "withdraw",
      region,
      method,
      amount,
      recipient,
      status: "Pending",
      createdAt: serverTimestamp()
    });
    alert("Withdrawal submitted!");
  } catch (err) {
    console.error(err);
    alert("Failed to submit withdrawal: " + err.message);
  }
});