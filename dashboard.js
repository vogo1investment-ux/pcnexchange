import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// -------------------- FIREBASE CONFIG --------------------
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

let realBalance = 0;
let hidden = false;

// -------------------- HIDE/SHOW BALANCE --------------------
document.getElementById("toggleBalanceBtn").addEventListener("click", () => {
  const balanceEl = document.getElementById("balance");
  if(!hidden){
    balanceEl.innerText = "******";
    document.getElementById("toggleBalanceBtn").innerText = "Show Balance";
    hidden = true;
  } else {
    balanceEl.innerText = "$" + realBalance.toLocaleString();
    document.getElementById("toggleBalanceBtn").innerText = "Hide Balance";
    hidden = false;
  }
});

// -------------------- CURRENCY CONVERTER --------------------
const rates = { USD:1, NGN:1310, GBP:0.78, EUR:0.92, CAD:1.35 };
document.getElementById("currencySelect").addEventListener("change", (e) => {
  const currency = e.target.value;
  const converted = realBalance * rates[currency];
  const balanceEl = document.getElementById("balance");
  switch(currency){
    case "USD": balanceEl.innerText = "$" + converted.toLocaleString(); break;
    case "NGN": balanceEl.innerText = "₦" + converted.toLocaleString(); break;
    case "GBP": balanceEl.innerText = "£" + converted.toLocaleString(); break;
    case "EUR": balanceEl.innerText = "€" + converted.toLocaleString(); break;
    case "CAD": balanceEl.innerText = "C$" + converted.toLocaleString(); break;
  }
});

// -------------------- AUTH & USER DATA --------------------
onAuthStateChanged(auth, (user) => {
  if(!user) {
    window.location = "index.html";
    return;
  }

  const userRef = doc(db,"users",user.uid);

  onSnapshot(userRef, (snap) => {
    if(!snap.exists()) return;
    const data = snap.data();
    document.getElementById("welcomeUser").innerText = data.username || data.name || data.email || "PCN USER";
    realBalance = Number(data.availableBalance || data.balance || 0);
    document.getElementById("balance").innerText = "$" + realBalance.toLocaleString();
  });
});

// -------------------- DEPOSIT & WITHDRAW --------------------
document.getElementById("depositBtn").addEventListener("click", () => window.location.href = "deposit.html");
document.getElementById("withdrawBtn").addEventListener("click", () => window.location.href = "withdraw.html");

// -------------------- SECTION SWITCHING --------------------
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".action-grid a, .bottom-nav a");

  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const sectionId = btn.dataset.section;
      if(!sectionId) return;
      document.querySelectorAll("section").forEach(sec=>sec.classList.add("hidden"));
      const target = document.getElementById(sectionId);
      if(target) target.classList.remove("hidden");
      window.scrollTo(0,0);
    });
  });
});

// -------------------- LOAD CRYPTO ASSETS --------------------
onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const assetsList = document.getElementById("assetsList");
  const userCoinsCol = collection(db, "users", user.uid, "coins");

  onSnapshot(userCoinsCol, snap=>{
    assetsList.innerHTML = "";
    if(snap.empty){
      assetsList.innerHTML = "You don't have any coins yet.";
      return;
    }
    snap.forEach(c=>{
      const coin = c.data();
      const div = document.createElement("div");
      div.className = "bg-zinc-800 p-4 rounded mb-2";
      div.innerHTML = `${coin.coinName} (${coin.symbol}) - Balance: ${coin.balance || 0}`;
      assetsList.appendChild(div);
    });
  });
});