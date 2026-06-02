import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

// Elements
const coinNameEl = document.getElementById("coinName");
const coinIconEl = document.getElementById("coinIcon");
const coinDescEl = document.getElementById("coinDesc");
const coinPriceEl = document.getElementById("coinPrice");
const coinBalanceEl = document.getElementById("coinBalance");
const sendBtn = document.getElementById("sendBtn");
const receiveBtn = document.getElementById("receiveBtn");
const buyBtn = document.getElementById("buyBtn");
const backBtn = document.getElementById("backBtn");

// Buy modal elements
const buyModal = document.getElementById("buyModal");
const closeBuyModal = document.getElementById("closeBuyModal");
const buyCoinName = document.getElementById("buyCoinName");
const buyAmount = document.getElementById("buyAmount");
const buyPassword = document.getElementById("buyPassword");
const confirmBuyBtn = document.getElementById("confirmBuyBtn");

let coinId = new URLSearchParams(window.location.search).get("coin"); // e.g., BTC
let userId = null;
let userCoinRef = null;

// Wait until user is logged in
onAuthStateChanged(auth, user => {
  if(!user){
    alert("You must be logged in!");
    window.location.href = "index.html";
    return;
  }
  userId = user.uid;
  loadCoinData();
});

// Load coin and user balance
async function loadCoinData(){
  const coinRef = doc(db,"coins",coinId);
  const coinSnap = await getDoc(coinRef);
  if(!coinSnap.exists()){
    alert("Coin not found!");
    return;
  }
  const coinData = coinSnap.data();
  coinNameEl.innerText = `${coinData.name} (${coinData.symbol})`;
  coinIconEl.src = coinData.iconUrl || "default-coin.png";
  coinDescEl.innerText = coinData.description || "No description available.";
  coinPriceEl.innerText = coinData.price ?? 0;

  // Reference to user's coin document
  userCoinRef = doc(db,"users",userId,"coins",coinId);

  // Real-time listener for balance
  onSnapshot(userCoinRef, snap => {
    if(snap.exists()){
      coinBalanceEl.innerText = parseFloat(snap.data().balance).toFixed(8);
    } else {
      coinBalanceEl.innerText = "0.00000001";
    }
  });
}

// Send / Receive buttons
sendBtn.addEventListener("click", ()=>{
  window.location.href = "transfer.html";
});
receiveBtn.addEventListener("click", ()=>{
  window.location.href = "receive.html";
});
backBtn.addEventListener("click", ()=>{
  window.location.href = "market.html";
});

// Buy button
buyBtn.addEventListener("click", ()=>{
  buyCoinName.innerText = coinNameEl.innerText;
  buyAmount.value = "";
  buyPassword.value = "";
  buyModal.classList.remove("hidden");
});

closeBuyModal.addEventListener("click", ()=> buyModal.classList.add("hidden"));

// Confirm Buy
confirmBuyBtn.addEventListener("click", async ()=>{
  const amount = parseFloat(buyAmount.value);
  const password = buyPassword.value;

  if(!amount || amount <=0 || !password){
    alert("Enter amount and password!");
    return;
  }

  try {
    const pendingRef = doc(collection(db,"pendingTransactions"));
    await setDoc(pendingRef,{
      coinId: coinId,
      userId: userId,
      amount: parseFloat(amount.toFixed(8)),
      price: parseFloat(coinPriceEl.innerText),
      status: "pending",
      createdAt: new Date(),
    });
    alert("Purchase request submitted! Status: pending for admin approval.");
    buyModal.classList.add("hidden");
  } catch(e){
    console.error("Failed to create pending transaction:", e);
    alert("Failed to submit purchase. Check console.");
  }
});