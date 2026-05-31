import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Default 20 coins
const coins = [
  {symbol:"BTC", name:"Bitcoin", price:30000},
  {symbol:"ETH", name:"Ethereum", price:1800},
  {symbol:"BNB", name:"Binance Coin", price:250},
  {symbol:"ADA", name:"Cardano", price:0.35},
  {symbol:"XRP", name:"Ripple", price:0.55},
  {symbol:"SOL", name:"Solana", price:25},
  {symbol:"DOGE", name:"Dogecoin", price:0.07},
  {symbol:"DOT", name:"Polkadot", price:5.5},
  {symbol:"MATIC", name:"Polygon", price:1.2},
  {symbol:"LTC", name:"Litecoin", price:120},
  {symbol:"AVAX", name:"Avalanche", price:15},
  {symbol:"UNI", name:"Uniswap", price:5},
  {symbol:"LINK", name:"Chainlink", price:6},
  {symbol:"ALGO", name:"Algorand", price:0.4},
  {symbol:"VET", name:"VeChain", price:0.08},
  {symbol:"FIL", name:"Filecoin", price:7},
  {symbol:"ICP", name:"Internet Computer", price:8},
  {symbol:"TRX", name:"TRON", price:0.06},
  {symbol:"ATOM", name:"Cosmos", price:10},
  {symbol:"XLM", name:"Stellar", price:0.1}
];

// Insert Market section dynamically
const marketBox = document.querySelector(".market-box");
const marketCoinsDiv = document.createElement("div");
marketCoinsDiv.id = "marketCoins";
marketCoinsDiv.style.marginTop = "20px";

coins.forEach(coin => {
  const card = document.createElement("div");
  card.style.background = "#111";
  card.style.border = "1px solid #0f0";
  card.style.borderRadius = "15px";
  card.style.padding = "15px";
  card.style.marginBottom = "10px";
  card.style.cursor = "pointer";
  card.style.display = "flex";
  card.style.justifyContent = "space-between";
  
  card.innerHTML = `<span>${coin.name} (${coin.symbol})</span><span>$${coin.price}</span>`;
  
  card.addEventListener("click", () => {
    window.location.href = `coin.html?symbol=${coin.symbol}`;
  });
  
  marketCoinsDiv.appendChild(card);
});

marketBox.appendChild(marketCoinsDiv);

// Auth user
onAuthStateChanged(auth, user => {
  if(!user) window.location.href="index.html";
  currentUser = user;
  const welcomeUser = document.getElementById("welcomeUser");
  welcomeUser.innerText = user.email || "PCN USER";
});

// Balance toggle
let hidden = false;
const toggleBtn = document.getElementById("toggleBalanceBtn");
toggleBtn.addEventListener("click", () => {
  const balanceEl = document.getElementById("balance");
  if(!hidden) {
    balanceEl.innerText = "******";
    toggleBtn.innerText = "Show Balance";
  } else {
    balanceEl.innerText = "$0"; // initial demo balance
    toggleBtn.innerText = "Hide Balance";
  }
  hidden = !hidden;
});