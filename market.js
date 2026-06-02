import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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
const coinSection = document.getElementById("coinSection");
const coinNameEl = document.getElementById("coinName");
const coinIconEl = document.getElementById("coinIcon");
const coinDescEl = document.getElementById("coinDesc");
const coinPriceEl = document.getElementById("coinPrice");
const coinBalanceEl = document.getElementById("coinBalance");
const backBtn = document.getElementById("backBtn");
const sendBtn = document.getElementById("sendBtn");
const receiveBtn = document.getElementById("receiveBtn");

let currentCoinDoc = null;
let currentCoinData = null;

onAuthStateChanged(auth, user => {
  if(!user){
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, snapshot => {
    if(snapshot.empty){
      marketList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    let coinsArray = [];
    snapshot.forEach(doc => coinsArray.push({id: doc.id, data: doc.data()}));

    // BTC first
    coinsArray.sort((a,b)=>{
      if(a.data.symbol==="BTC") return -1;
      if(b.data.symbol==="BTC") return 1;
      return 0;
    });

    marketList.innerHTML = "";

    coinsArray.forEach(coin => {
      const div = document.createElement("div");
      div.className = "market-card";
      div.innerHTML = `
        <img src="${coin.data.iconUrl || 'default-coin.png'}" class="coin-icon" alt="${coin.data.symbol}">
        <h3>${coin.data.name} (${coin.data.symbol})</h3>
        <p>${coin.data.description || "No description"}</p>
        <p>Price: $${coin.data.price ?? 0}</p>
      `;

      div.addEventListener("click", ()=>{
        currentCoinDoc = coin.id;
        currentCoinData = coin.data;
        openCoinSection();
      });

      marketList.appendChild(div);
    });
  });
});

function openCoinSection(){
  marketList.classList.add("hidden");
  coinSection.classList.remove("hidden");
  coinNameEl.innerText = `${currentCoinData.name} (${currentCoinData.symbol})`;
  coinIconEl.src = currentCoinData.iconUrl || "default-coin.png";
  coinDescEl.innerText = currentCoinData.description || "No description";
  coinPriceEl.innerText = currentCoinData.price ?? 0;
  coinBalanceEl.innerText = currentCoinData.balance ?? 0.00000001;
}

backBtn.addEventListener("click", ()=>{
  coinSection.classList.add("hidden");
  marketList.classList.remove("hidden");
});

// Example Send / Receive buttons (you can expand to open modals)
sendBtn.addEventListener("click", ()=>{
  let newBalance = parseFloat(coinBalanceEl.innerText) - 0.00000001;
  if(newBalance<0) newBalance = 0;
  coinBalanceEl.innerText = newBalance.toFixed(8);
  updateCoinBalance(newBalance);
});

receiveBtn.addEventListener("click", ()=>{
  let newBalance = parseFloat(coinBalanceEl.innerText) + 0.00000001;
  coinBalanceEl.innerText = newBalance.toFixed(8);
  updateCoinBalance(newBalance);
});

async function updateCoinBalance(newBalance){
  if(!currentCoinDoc) return;
  const coinRef = doc(db, "coins", currentCoinDoc);
  await updateDoc(coinRef, {balance: parseFloat(newBalance.toFixed(8))});
}