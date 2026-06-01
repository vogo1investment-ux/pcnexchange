import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const coinsRoot = collection(db, "coins");
const previousPrices = {};

async function loadAllCoins() {
  marketContainer.innerHTML = "";

  const coinDocs = await getDocs(coinsRoot);
  if(coinDocs.empty){
    marketContainer.innerHTML = "<p style='color:#f00;'>No coins found in Firebase.</p>";
    return;
  }

  for(const coinParentDoc of coinDocs.docs){
    const coinId = coinParentDoc.id;
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
      `;

      card.addEventListener("click", () => {
        window.location.href = `coin.html?symbol=${coin.symbol}`;
      });

      marketContainer.appendChild(card);
    });
  }
}

// Initial load + refresh every 10s
loadAllCoins();
setInterval(loadAllCoins, 10000);