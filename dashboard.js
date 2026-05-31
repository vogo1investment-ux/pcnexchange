import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 🔹 USE ORIGINAL FIREBASE API
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

// FORCE SESSION STABILITY
setPersistence(auth, browserLocalPersistence);

// STATE
let balance = 0;
let hidden = false;

// TOGGLE BALANCE
const balanceEl = document.getElementById("balance");
const toggleBtn = document.getElementById("toggleBalanceBtn");

toggleBtn.addEventListener("click", () => {
  if (!hidden) {
    balanceEl.innerText = "******";
    toggleBtn.innerText = "Show Balance";
  } else {
    balanceEl.innerText = "$" + balance.toLocaleString();
    toggleBtn.innerText = "Hide Balance";
  }
  hidden = !hidden;
});

// CURRENCY CONVERTER
const rates = { USD: 1, NGN: 1310, GBP: 0.78, EUR: 0.92, CAD: 1.35 };
const currencySelect = document.getElementById("currencySelect");
currencySelect.addEventListener("change", (e) => {
  const converted = balance * rates[e.target.value];
  const symbol = e.target.value === "USD" ? "$" : e.target.value === "NGN" ? "₦" : e.target.value === "GBP" ? "£" : e.target.value === "EUR" ? "€" : "C$";
  balanceEl.innerText = symbol + converted.toLocaleString();
});

// REALTIME USER DATA
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("welcomeUser").innerText = data.username || data.email || "PCN USER";
    balance = Number(data.availableBalance || data.balance || 0);
    if (!hidden) balanceEl.innerText = "$" + balance.toLocaleString();
  });
});

// DEPOSIT & WITHDRAW BUTTONS
const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

depositBtn.addEventListener("click", () => window.location.href = "deposit.html");
withdrawBtn.addEventListener("click", () => window.location.href = "withdraw.html");