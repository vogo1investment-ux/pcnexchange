import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
const urlParams = new URLSearchParams(window.location.search);
const coinSymbol = urlParams.get("symbol");

// Get elements
const coinNameEl = document.getElementById("coinName");
const coinDescriptionEl = document.getElementById("coinDescription");
const coinPriceEl = document.getElementById("coinPrice");
const coinMetricsEl = document.getElementById("coinMetrics");
const userBalanceEl = document.getElementById("userBalance");
const swapAmountEl = document.getElementById("swapAmount");
const swapBtn = document.getElementById("swapBtn");
const transferBtn = document.getElementById("transferBtn");
const receiveBtn = document.getElementById("receiveBtn");

onAuthStateChanged(auth, user => {
  if(!user) window.location.href="index.html";
  currentUser = user;
  loadUserBalance();
  loadCoinDetails();
});

// Load coin metrics and price from Firebase in real-time
function loadCoinDetails(){
  const coinRef = doc(db,"coins",coinSymbol);
  onSnapshot(coinRef, coinSnap => {
    if(!coinSnap.exists()) return alert("Coin not found");
    const coin = coinSnap.data();
    coinNameEl.innerText = `${coin.name} (${coin.symbol})`;
    coinDescriptionEl.innerText = coin.description;
    coinPriceEl.innerText = `$${coin.price}`;
    coinMetricsEl.innerText = `
Market Cap: $${coin.marketCap || "N/A"}
24h Volume: $${coin.volume24h || "N/A"}
Supply: ${coin.supply || "N/A"}
24h Change: ${coin.change24h || "0%"}
    `;
  });
}

// Load user coin balance in real-time
function loadUserBalance(){
  const userRef = doc(db,"users",currentUser.uid);
  onSnapshot(userRef, snap => {
    const userData = snap.data();
    const coinBal = userData.coins && userData.coins[coinSymbol] ? userData.coins[coinSymbol] : 0;
    userBalanceEl.innerText = `Your Balance: ${coinBal}`;
  });
}

// Swap functionality
swapBtn.addEventListener("click", async () => {
  const amount = Number(swapAmountEl.value);
  if(!amount || amount <= 0) return alert("Enter valid amount");

  const userRef = doc(db,"users",currentUser.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if(!userData || !userData.availableBalance || userData.availableBalance < amount){
    return alert("Insufficient balance");
  }

  await updateDoc(userRef, {
    availableBalance: userData.availableBalance - amount,
    transactions: arrayUnion({
      type:"swap",
      coin:coinSymbol,
      amount:amount,
      timestamp:Date.now(),
      status:"pending"
    })
  });

  alert(`Swap ${amount} to ${coinSymbol} submitted. Pending approval.`);
  swapAmountEl.value = "";
});

// Transfer placeholder
transferBtn.addEventListener("click", () => {
  alert("Transfer functionality coming soon.");
});

// Receive placeholder
receiveBtn.addEventListener("click", () => {
  alert("Receive functionality coming soon.");
});