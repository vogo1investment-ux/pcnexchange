import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
let selectedCoin = null;

const coinsListDiv = document.getElementById("coinsList");
const stakedBalanceSpan = document.getElementById("stakedBalance");
const stakeHistoryDiv = document.getElementById("stakeHistory");

const stakeModal = document.getElementById("stakeModal");
const modalCoinName = document.getElementById("modalCoinName");
const stakeAmountInput = document.getElementById("stakeAmount");
const stakePasswordInput = document.getElementById("stakePassword");
const stakeDateInput = document.getElementById("stakeDate");
const stakeTimeInput = document.getElementById("stakeTime");
const confirmStakeBtn = document.getElementById("confirmStakeBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// Example coins with interest
const availableCoins = [
  { name: "BTC", interest: 5 },
  { name: "ETH", interest: 6 },
  { name: "SOL", interest: 7 },
  { name: "USDT", interest: 2 },
  { name: "BNB", interest: 4 }
];

onAuthStateChanged(auth, async (user) => {
  if (!user) return alert("Login required");
  currentUser = user;
  renderCoins();
  renderStakeHistory();
});

// Render coins with Stake buttons
function renderCoins() {
  coinsListDiv.innerHTML = "";
  availableCoins.forEach(c => {
    const div = document.createElement("div");
    div.className = "p-4 border border-zinc-700 rounded flex justify-between items-center";
    div.innerHTML = `
      <div>
        <strong>${c.name}</strong> - Interest: ${c.interest}%/annum
      </div>
      <button class="bg-emerald-400 text-black font-bold p-2 rounded stake-btn">Stake</button>
    `;
    coinsListDiv.appendChild(div);

    div.querySelector(".stake-btn").addEventListener("click", () => {
      selectedCoin = c.name;
      modalCoinName.innerText = `Stake ${c.name}`;
      stakeModal.classList.remove("hidden");
    });
  });
}

// Close modal
closeModalBtn.addEventListener("click", () => {
  stakeModal.classList.add("hidden");
  stakeAmountInput.value = "";
  stakePasswordInput.value = "";
  stakeDateInput.value = "";
  stakeTimeInput.value = "";
});

// Confirm stake submission
confirmStakeBtn.addEventListener("click", async () => {
  const amount = parseFloat(stakeAmountInput.value);
  const pwd = stakePasswordInput.value.trim();
  const date = stakeDateInput.value;
  const time = stakeTimeInput.value;

  if (!amount || !pwd || !date || !time || !selectedCoin) {
    return alert("Please fill all fields");
  }

  await addDoc(collection(db, "stakes"), {
    userId: currentUser.uid,
    coin: selectedCoin,
    stakedAmount: amount,
    password: pwd,
    date,
    time,
    status: "Pending",
    createdAt: serverTimestamp()
  });

  alert("Stake request submitted!");
  stakeModal.classList.add("hidden");
  stakeAmountInput.value = "";
  stakePasswordInput.value = "";
  stakeDateInput.value = "";
  stakeTimeInput.value = "";
  renderStakeHistory();
});

// Render stake history
async function renderStakeHistory() {
  const q = query(collection(db, "stakes"), where("userId", "==", currentUser.uid));
  const snap = await getDocs(q);
  stakeHistoryDiv.innerHTML = "";
  let totalStaked = 0;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    totalStaked += data.stakedAmount || 0;

    const div = document.createElement("div");
    div.className = "p-2 border-b border-zinc-700";
    div.innerHTML = `<strong>${data.coin}</strong> - Amount: ${data.stakedAmount} - Status: ${data.status} - Date: ${data.date} ${data.time}`;
    stakeHistoryDiv.appendChild(div);
  });

  stakedBalanceSpan.innerText = totalStaked.toFixed(8);
}