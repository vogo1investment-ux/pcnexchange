import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const marketList = document.getElementById("marketList");

onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  // Listen to coins collection
  onSnapshot(coinsRef, async (snapshot) => {
    if(snapshot.empty){
      marketList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    marketList.innerHTML = "";

    const coinsArray = [];
    snapshot.forEach(docSnap => coinsArray.push({id: docSnap.id, data: docSnap.data()}));

    // Put BTC first
    coinsArray.sort((a,b) => a.data.symbol === "BTC" ? -1 : 0);

    for(const coin of coinsArray){
      // Determine price color based on previous price
      let priceColor = "blue"; // default
      if(coin.data.prevPrice !== undefined){
        if(coin.data.price > coin.data.prevPrice) priceColor = "green";
        else if(coin.data.price < coin.data.prevPrice) priceColor = "red";
      }

      const div = document.createElement("div");
      div.className = "market-card";
      div.innerHTML = `
        <img src="${coin.data.iconUrl || 'default-coin.png'}" class="coin-icon">
        <h3>${coin.data.name} (${coin.data.symbol})</h3>
        <p style="color:${priceColor}">Price: $${coin.data.price}</p>
        <p>${coin.data.description || "No description available."}</p>
      `;

      div.addEventListener("click", () => {
        window.location.href = `coin.html?coin=${coin.id}`;
      });

      marketList.appendChild(div);
    }
  });
});