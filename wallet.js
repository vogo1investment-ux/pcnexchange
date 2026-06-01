import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

let currentUser = null;

const totalBalanceEl = document.getElementById("totalBalance");
const referralCodeEl = document.getElementById("referralCode");
const referralEarningsEl = document.getElementById("referralEarnings");
const coinBalancesEl = document.getElementById("coinBalances");
const transactionHistoryEl = document.getElementById("transactionHistory");
const copyReferralBtn = document.getElementById("copyReferralBtn");

onAuthStateChanged(auth, async user => {
  if(!user) {
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  // Load referral code & earnings
  const userDoc = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDoc);
  if(snapshot.exists()){
    const data = snapshot.data();
    referralCodeEl.innerText = data.referralCode || "XXXX1234";
    referralEarningsEl.innerText = data.referralEarnings || 0.00;
  }

  // Load coin balances
  const coinsCol = collection(db, "users", user.uid, "coins");
  onSnapshot(coinsCol, snap => {
    coinBalancesEl.innerHTML = "";
    let total = 0;
    snap.forEach(docSnap => {
      const coin = docSnap.data();
      const card = document.createElement("div");
      card.className = "coin-balance";
      card.innerHTML = `${coin.symbol}: ${coin.balance || 0}`;
      coinBalancesEl.appendChild(card);
      total += coin.balance * (coin.price || 0);
    });
    totalBalanceEl.innerText = total.toFixed(2);
  });

  // Load transactions
  const transactionsCol = collection(db, "users", user.uid, "transactions");
  onSnapshot(transactionsCol, snap => {
    transactionHistoryEl.innerHTML = "";
    snap.forEach(docSnap => {
      const tx = docSnap.data();
      const card = document.createElement("div");
      card.className = "transaction-card";
      card.innerHTML = `${tx.date || ""} | ${tx.type || ""} | ${tx.coin || ""} | ${tx.amount || 0} | ${tx.status || ""}`;
      transactionHistoryEl.appendChild(card);
    });
  });
});

// Copy referral code
copyReferralBtn.addEventListener("click", ()=>{
  navigator.clipboard.writeText(referralCodeEl.innerText);
  alert("Referral code copied!");
});