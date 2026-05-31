import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const coins = [
  {symbol:"BTC", name:"Bitcoin", price:30000, prevPrice:30000},
  {symbol:"ETH", name:"Ethereum", price:1800, prevPrice:1800},
  {symbol:"BNB", name:"Binance Coin", price:250, prevPrice:250},
  {symbol:"ADA", name:"Cardano", price:0.35, prevPrice:0.35},
  {symbol:"XRP", name:"Ripple", price:0.55, prevPrice:0.55},
  {symbol:"SOL", name:"Solana", price:25, prevPrice:25},
  {symbol:"DOGE", name:"Dogecoin", price:0.07, prevPrice:0.07},
  {symbol:"DOT", name:"Polkadot", price:5.5, prevPrice:5.5},
  {symbol:"MATIC", name:"Polygon", price:1.2, prevPrice:1.2},
  {symbol:"LTC", name:"Litecoin", price:120, prevPrice:120},
  {symbol:"AVAX", name:"Avalanche", price:15, prevPrice:15},
  {symbol:"UNI", name:"Uniswap", price:5, prevPrice:5},
  {symbol:"LINK", name:"Chainlink", price:6, prevPrice:6},
  {symbol:"ALGO", name:"Algorand", price:0.4, prevPrice:0.4},
  {symbol:"VET", name:"VeChain", price:0.08, prevPrice:0.08},
  {symbol:"FIL", name:"Filecoin", price:7, prevPrice:7},
  {symbol:"ICP", name:"Internet Computer", price:8, prevPrice:8},
  {symbol:"TRX", name:"TRON", price:0.06, prevPrice:0.06},
  {symbol:"ATOM", name:"Cosmos", price:10, prevPrice:10},
  {symbol:"XLM", name:"Stellar", price:0.1, prevPrice:0.1}
];

// Create coins in Firebase if they don't exist
coins.forEach(async (coin) => {
  const coinRef = doc(db, "coins", coin.symbol);
  const snap = await getDoc(coinRef);
  if (!snap.exists()) {
    await setDoc(coinRef, coin);
    console.log("Created coin in Firebase:", coin.symbol);
  }
});