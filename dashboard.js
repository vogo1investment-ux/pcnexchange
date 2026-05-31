import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// FORCE SESSION STABILITY
setPersistence(auth, browserLocalPersistence);

// ================= STATE =================
let balance = 0;
let hidden = false;

// ================= TOGGLE BALANCE =================
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

// ================= CURRENCY =================
const rates = { USD: 1, NGN: 1310, GBP: 0.78, EUR: 0.92, CAD: 1.35 };

function convert(currency) {
  const converted = balance * rates[currency];
  const symbol = currency === "USD" ? "$" : currency === "NGN" ? "₦" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "C$";
  balanceEl.innerText = symbol + converted.toLocaleString();
}

// ================= REAL TIME AUTH =================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "index.html";
    return;
  }

  const ref = doc(db, "users", user.uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    // USERNAME
    document.getElementById("welcomeUser").innerText = data.username || data.email || "PCN USER";

    // BALANCE
    balance = data.availableBalance || 0;
    if (!hidden) {
      balanceEl.innerText = "$" + balance.toLocaleString();
    }
  });
});

// ================= CURRENCY EVENT =================
document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("currencySelect");
  if (select) {
    select.addEventListener("change", (e) => {
      convert(e.target.value);
    });
  }

  // ================= DEPOSIT & WITHDRAW BUTTONS =================
  const depositBtn = document.getElementById("depositBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");

  if (depositBtn) depositBtn.addEventListener("click", () => window.location.href = "deposit.html");
  if (withdrawBtn) withdrawBtn.addEventListener("click", () => window.location.href = "withdraw.html");
});