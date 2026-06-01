import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

// Get coin symbol from URL
const urlParams = new URLSearchParams(window.location.search);
const coinSymbol = urlParams.get("symbol");

const coinNameEl = document.getElementById("coinName");
const coinDescEl = document.getElementById("coinDescription");
const coinPriceEl = document.getElementById("coinPrice");
const coinMarketCapEl = document.getElementById("coinMarketCap");
const coinVolumeEl = document.getElementById("coinVolume");
const coinSupplyEl = document.getElementById("coinSupply");
const coinChangeEl = document.getElementById("coinChange");
const userCoinBalanceEl = document.getElementById("userCoinBalance");

// Load coin details
async function loadCoin() {
  // coins/ADA/ADA document path
  const coinDoc = doc(db, "coins", coinSymbol, coinSymbol);
  const snapshot = await getDoc(coinDoc);

  if(snapshot.exists()){
    const coin = snapshot.data();
    coinNameEl.innerText = `${coin.name} (${coin.symbol})`;
    coinDescEl.innerText = coin.description;
    coinPriceEl.innerText = coin.price;
    coinMarketCapEl.innerText = coin.marketCap || "N/A";
    coinVolumeEl.innerText = coin.volume24h || "N/A";
    coinSupplyEl.innerText = coin.supply || "N/A";
    coinChangeEl.innerText = coin.change24h || "0%";
  } else {
    coinNameEl.innerText = "Coin not found!";
  }
}

// Load user coin balance
onAuthStateChanged(auth, async (user)=>{
  if(!user) return;

  const userCoinDoc = doc(db, "users", user.uid, "coins", coinSymbol);
  const userSnapshot = await getDoc(userCoinDoc);
  if(userSnapshot.exists()){
    const coinData = userSnapshot.data();
    userCoinBalanceEl.innerText = coinData.balance || 0;
  } else {
    userCoinBalanceEl.innerText = 0;
  }
});

loadCoin();