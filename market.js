import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const coinsCol = collection(db, "coins");

// Store previous prices for red/blue indicator
const previousPrices = {};

onSnapshot(coinsCol, snapshot => {
  marketContainer.innerHTML = "";
  
  snapshot.forEach(doc => {
    const coin = doc.data();

    // Price color indicator
    let priceColor = "#0f0";
    if(previousPrices[coin.symbol] !== undefined){
      if(coin.price > previousPrices[coin.symbol]) priceColor = "#00f"; // blue
      else if(coin.price < previousPrices[coin.symbol]) priceColor = "#f00"; // red
    }
    previousPrices[coin.symbol] = coin.price;

    const card = document.createElement("div");
    card.className = "coin-card";

    // Display all coin details
    card.innerHTML = `
      <div class="coin-name">${coin.name} (${coin.symbol})</div>
      <div class="coin-description">${coin.description}</div>
      <div class="coin-price" style="color:${priceColor}">$${coin.price}</div>
      <div class="coin-marketcap">Market Cap: $${coin.marketCap || "N/A"}</div>
      <div class="coin-volume">24h Volume: $${coin.volume24h || "N/A"}</div>
      <div class="coin-supply">Supply: ${coin.supply || "N/A"}</div>
      <div class="coin-change">Change 24h: ${coin.change24h || "0%"}%</div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `coin.html?symbol=${coin.symbol}`;
    });

    marketContainer.appendChild(card);
  });
});