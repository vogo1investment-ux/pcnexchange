import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, snapshot => {
    if (snapshot.empty) {
      marketList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    let coinsArray = [];
    snapshot.forEach(doc => coinsArray.push({ id: doc.id, data: doc.data() }));

    // BTC first
    coinsArray.sort((a, b) => {
      if (a.data.symbol === "BTC") return -1;
      if (b.data.symbol === "BTC") return 1;
      return 0;
    });

    marketList.innerHTML = "";

    coinsArray.forEach(coin => {
      const div = document.createElement("div");
      div.className = "market-card";
      div.innerHTML = `
        <img src="${coin.data.iconUrl || 'default-coin.png'}" class="coin-icon" alt="${coin.data.symbol}">
        <h3>${coin.data.name} (${coin.data.symbol})</h3>
        <p>${coin.data.description || "No description available."}</p>
        <p>Price: $${coin.data.price ?? 0}</p>
      `;

      div.addEventListener("click", () => {
        window.location.href = `coin.html?coin=${coin.id}`;
      });

      marketList.appendChild(div);
    });
  });
});