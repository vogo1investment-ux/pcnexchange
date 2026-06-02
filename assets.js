import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const assetsList = document.getElementById("assetsList");

onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, async snapshot => {
    if(snapshot.empty){
      assetsList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    assetsList.innerHTML = "";
    const coinsArray = [];

    snapshot.forEach(docSnap => coinsArray.push({id: docSnap.id, data: docSnap.data()}));
    // BTC first
    coinsArray.sort((a,b) => {
      if(a.data.symbol === "BTC") return -1;
      if(b.data.symbol === "BTC") return 1;
      return 0;
    });

    for(const coin of coinsArray){
      // Get user coin balance
      const userCoinRef = doc(db,"users",user.uid,"coins",coin.id);
      const userCoinSnap = await getDoc(userCoinRef);
      let balance = "0.00000001";
      if(userCoinSnap.exists()){
        balance = parseFloat(userCoinSnap.data().balance).toFixed(8);
      } else {
        // auto-create user coin if not exist
        await setDoc(userCoinRef, { balance: 0.00000001 });
      }

      // Price change indicator
      let priceColor = "blue"; // default
      if(userCoinSnap.exists() && userCoinSnap.data().lastPrice !== undefined){
        const lastPrice = userCoinSnap.data().lastPrice;
        if(coin.data.price > lastPrice) priceColor = "green";
        else if(coin.data.price < lastPrice) priceColor = "red";
      }

      // Asset card
      const div = document.createElement("div");
      div.className = "asset-card";
      div.innerHTML = `
        <img src="${coin.data.iconUrl || 'default-coin.png'}" class="coin-icon">
        <h3>${coin.data.name} (${coin.data.symbol})</h3>
        <p style="color:${priceColor}">Price: $${coin.data.price ?? 0}</p>
        <p>Your Balance: ${balance}</p>
      `;

      div.addEventListener("click", ()=>{
        window.location.href = `coin.html?coin=${coin.id}`;
      });

      assetsList.appendChild(div);
    }
  });
});