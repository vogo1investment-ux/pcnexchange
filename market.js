import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, async (snapshot) => {
    if (snapshot.empty) {
      marketList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    marketList.innerHTML = "";
    const coinsArray = [];

    snapshot.forEach(docSnap => coinsArray.push({id: docSnap.id, data: docSnap.data()}));
    coinsArray.sort((a,b) => a.data.symbol === "BTC" ? -1 : 0); // BTC first

    for(const coin of coinsArray){
      const coinRef = doc(db,"coins",coin.id);
      const coinSnap = await getDoc(coinRef);
      const lastPrice = coinSnap.exists() && coinSnap.data().lastPrice !== undefined
        ? coinSnap.data().lastPrice
        : coin.data.price;

      let priceColor = "blue";
      if(coin.data.price > lastPrice) priceColor = "green";
      else if(coin.data.price < lastPrice) priceColor = "red";

      await setDoc(coinRef, { lastPrice: coin.data.price }, { merge: true });

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