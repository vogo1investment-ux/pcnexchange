// market.js - works with coins as subcollections under "coins"
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const marketContainer = document.getElementById("marketCoins");
const coinsRoot = collection(db, "coins"); // top-level coins collection
const previousPrices = {};

// Fetch all subcollections of coins
async function loadAllCoins() {
  marketContainer.innerHTML = ""; // clear

  const coinDocs = await getDocs(coinsRoot); // each top-level coin document (acting as parent)
  if(coinDocs.empty){
    marketContainer.innerHTML = "<p style='color:#f00;'>No coins found. Please add coins.</p>";
    return;
  }

  for(const coinParentDoc of coinDocs.docs){
    const coinId = coinParentDoc.id; // e.g., "ADA"
    const subCollectionRef = collection(db, "coins", coinId);
    const coinSnapshot = await getDocs(subCollectionRef);

    coinSnapshot.forEach(docSnap => {
      const coin = docSnap.data();

      let priceColor = "#0f0";
      if(previousPrices[coin.symbol] !== undefined){
        if(coin.price > previousPrices[coin.symbol]) priceColor = "#00f";
        else if(coin.price < previousPrices[coin.symbol]) priceColor = "#f00";
      }
      previousPrices[coin.symbol] = coin.price;

      const card = document.createElement("div");
      card.className = "coin-card";
      card.innerHTML = `
        <div class="coin-name">${coin.name} (${coin.symbol})</div>
        <div class="coin-description">${coin.description}</div>
        <div class="coin-price" style="color:${priceColor}">$${coin.price}</div>
        <div class="coin-metrics">
          Market Cap: $${coin.marketCap || "N/A"}<br>
          24h Volume: $${coin.volume24h || "N/A"}<br>
          Supply: ${coin.supply || "N/A"}<br>
          24h Change: ${coin.change24h || "0%"}%
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `coin.html?symbol=${coin.symbol}`;
      });

      marketContainer.appendChild(card);
    });
  }
}

// Initial load and refresh every 10s
loadAllCoins();
setInterval(loadAllCoins, 10000);