import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser;
const coinSelect = document.getElementById("coinSelect");
const coinBalance = document.getElementById("coinBalance");
const stakeOptionBtn = document.getElementById("stakeOptionBtn");

// Example coin list
const availableCoins = ["BTC", "ETH", "SOL", "USDT", "BNB"];

onAuthStateChanged(auth, async (user) => {
  if (!user) return alert("Please log in to trade.");
  currentUser = user;

  // Populate coin dropdown
  coinSelect.innerHTML = '<option value="" disabled selected>Select a coin</option>';
  availableCoins.forEach((coin) => {
    const option = document.createElement("option");
    option.value = coin;
    option.textContent = coin;
    coinSelect.appendChild(option);
  });

  // Show user balance when coin selected
  coinSelect.addEventListener("change", async () => {
    const selectedCoin = coinSelect.value;
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists()) return;
      const coins = userDoc.data().coins || [];
      const coinData = coins.find(c => c.name === selectedCoin);
      coinBalance.textContent = coinData ? coinData.balance : "0.00000000";
    } catch (err) {
      console.error(err);
      coinBalance.textContent = "0.00000000";
    }
  });
});

// Navigate to stake page
stakeOptionBtn.addEventListener("click", () => {
  window.location.href = "stake.html";
});