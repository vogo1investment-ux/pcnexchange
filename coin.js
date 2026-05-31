import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Elements
const coinNameEl = document.getElementById("coinName");
const coinSymbolEl = document.getElementById("coinSymbol");
const coinPriceEl = document.getElementById("coinPrice");
const swapBtn = document.getElementById("swapBtn");
const swapForm = document.getElementById("swapForm");
const swapAmount = document.getElementById("swapAmount");
const submitSwap = document.getElementById("submitSwap");

onAuthStateChanged(auth, user => {
  if(!user) window.location.href="index.html";
  currentUser = user;
});

// Load coin info from Firebase or fallback to JSON
async function loadCoin(){
  let coinData;
  const docRef = doc(db, "coins", coinSymbol);
  const snap = await getDoc(docRef);
  if(snap.exists()) coinData = snap.data();
  else {
    const res = await fetch("coins_with_descriptions.json");
    const coins = await res.json();
    coinData = coins.find(c => c.symbol === coinSymbol);
  }
  if(!coinData) return alert("Coin not found");
  coinNameEl.innerText = coinData.name;
  coinSymbolEl.innerText = coinData.symbol;
  coinPriceEl.innerText = "$"+coinData.price;
}

loadCoin();

// Show/hide swap form
swapBtn.addEventListener("click", () => swapForm.classList.toggle("hidden"));

// Swap functionality
submitSwap.addEventListener("click", async () => {
  const amount = Number(swapAmount.value);
  if(!amount || amount <= 0) return alert("Enter valid amount");
  if(!currentUser) return alert("User not logged in");

  const userRef = doc(db,"users",currentUser.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if(!userData || !userData.availableBalance || userData.availableBalance < amount)
    return alert("Insufficient balance");

  // Deduct balance and create pending transaction
  await updateDoc(userRef, {
    availableBalance: userData.availableBalance - amount,
    transactions: arrayUnion({
      type: "swap",
      coin: coinSymbol,
      amount: amount,
      timestamp: Date.now(),
      status: "pending"
    })
  });

  alert(`Swap ${amount} to ${coinSymbol} submitted. Pending approval.`);
  swapAmount.value = "";
  swapForm.classList.add("hidden");
});