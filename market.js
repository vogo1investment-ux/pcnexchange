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

const coinsList = document.getElementById("coinsList");

// Listen to Firebase coins collection
const coinsRef = collection(db, "coins");
onSnapshot(coinsRef, snapshot => {
  coinsList.innerHTML = "";
  snapshot.forEach(doc => {
    const coin = doc.data();
    const prevPrice = coin.prevPrice || coin.price; // store prev price to compare
    const changeClass = coin.price > prevPrice ? "blue" : coin.price < prevPrice ? "red" : "";
    const card = document.createElement("div");
    card.className = "coin-card";
    card.innerHTML = `
      <div>
        <div class="coin-name">${coin.name} (${coin.symbol})</div>
      </div>
      <div>
        <span class="coin-price">$${coin.price.toLocaleString()}</span>
        <span class="coin-change ${changeClass}">${(coin.price - prevPrice).toLocaleString()}</span>
      </div>
    `;
    // click to open coin details
    card.addEventListener("click", () => {
      window.location.href = `coin.html?symbol=${coin.symbol}`;
    });
    coinsList.appendChild(card);
  });
});