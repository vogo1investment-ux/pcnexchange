import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, getDoc, doc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

async function loadCoins() {
  const marketBox = document.querySelector(".market-box");
  const marketCoinsDiv = document.createElement("div");
  marketCoinsDiv.id = "marketCoins";

  // Fetch coins from Firebase if available
  const coinsSnapshot = await getDocs(collection(db, "coins"));
  let coins = [];

  if(!coinsSnapshot.empty){
    coinsSnapshot.forEach(doc => coins.push(doc.data()));
  } else {
    // Fallback to JSON file if coins collection empty
    const res = await fetch("coins_with_descriptions.json");
    coins = await res.json();
  }

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

    card.innerHTML = `<div>
        <strong>${coin.name} (${coin.symbol})</strong>
        <p style="color:#0f0">${coin.description}</p>
      </div>
      <div>$${coin.price}</div>`;

    card.addEventListener("click", () => {
      window.location.href = `coin.html?symbol=${coin.symbol}`;
    });

    marketCoinsDiv.appendChild(card);
  });

  marketBox.appendChild(marketCoinsDiv);
}

loadCoins();