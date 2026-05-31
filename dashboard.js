import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

// -------------------- STATE --------------------
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

  // Real-time listener
  onSnapshot(userRef, (snap) => {
    if(!snap.exists()) return;
    const data = snap.data();

    // Username display
    document.getElementById("welcomeUser").innerText = data.username || data.name || data.email || "PCN USER";

    // Balance display
    realBalance = Number(data.availableBalance || data.balance || 0);
    document.getElementById("balance").innerText = "$" + realBalance.toLocaleString();
  });
});

// -------------------- DEPOSIT & WITHDRAW BUTTONS --------------------
document.getElementById("depositBtn").addEventListener("click", () => {
  window.location.href = "deposit.html";
});

document.getElementById("withdrawBtn").addEventListener("click", () => {
  window.location.href = "withdraw.html";
});