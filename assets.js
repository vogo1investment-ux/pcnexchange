import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const assetsList = document.getElementById("assetsList");

onAuthStateChanged(auth, user => {
  if(!user){
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, snapshot => {
    if(snapshot.empty){
      assetsList.innerHTML = "<p>No coins found.</p>";
      return;
    }

    let coinsArray = [];
    snapshot.forEach(doc => coinsArray.push(doc.data()));

    // Sort BTC first
    coinsArray.sort((a,b)=>{
      if(a.symbol==="BTC") return -1;
      if(b.symbol==="BTC") return 1;
      return 0;
    });

    assetsList.innerHTML = "";

    coinsArray.forEach(coin => {
      const priceChange = (coin.price && coin.prevPrice) ? coin.price - coin.prevPrice : 0;
      const changeClass = priceChange >= 0 ? "price-up" : "price-down";

      const div = document.createElement("div");
      div.className = "coin-card";

      div.innerHTML = `
        <div class="coin-header">
          <img src="${coin.iconUrl || 'default-coin.png'}" class="coin-icon" alt="${coin.symbol}">
          <h3 class="coin-name">${coin.name} (${coin.symbol})</h3>
        </div>
        <p class="coin-balance">Balance: ${coin.balance ?? 0}</p>
        <p class="coin-price">Price: $${coin.price ?? 0} <span class="${changeClass}">${priceChange >=0 ? "+" : ""}${priceChange.toFixed(2)}</span></p>
        <p class="coin-desc">Description: ${coin.description || "No description"}</p>
      `;
      assetsList.appendChild(div);
    });
  });
});