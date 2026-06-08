import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const coinNameEl = document.getElementById("coinName");
const coinIconEl = document.getElementById("coinIcon");
const coinDescEl = document.getElementById("coinDesc");
const coinPriceEl = document.getElementById("coinPrice");
const coinBalanceEl = document.getElementById("coinBalance");

let coinId = new URLSearchParams(window.location.search).get("coin");
let userId = null;
let userCoinRef = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "index.html";
  userId = user.uid;

  await loadCoinData();
});

async function loadCoinData() {
  try {
    const coinRef = doc(db, "coins", coinId);
    const coinSnap = await getDoc(coinRef);

    if (!coinSnap.exists()) {
      coinNameEl.innerText = "Coin not found";
      coinDescEl.innerText = "";
      coinPriceEl.innerText = 0;
      coinIconEl.src = "/public/coins/default-coin.png";
      return;
    }

    const coinData = coinSnap.data();

    coinNameEl.innerText = `${coinData.name} (${coinData.symbol})`;
    coinDescEl.innerText = coinData.description || "No description available";
    coinPriceEl.innerText = coinData.price ?? 0;

    // Load coin image from public folder automatically
    const symbolLower = coinData.symbol.toLowerCase();
    coinIconEl.src = `/public/coins/${symbolLower}.jpg`;

    // Fallback if image doesn't exist
    coinIconEl.onerror = () => {
      coinIconEl.src = "/public/coins/default-coin.png";
    };

    // Load user balance
    userCoinRef = doc(db, "users", userId, "coins", coinId);
    const userCoinSnap = await getDoc(userCoinRef);

    if (!userCoinSnap.exists()) {
      await setDoc(userCoinRef, { balance: 0.00000001 });
    }

    onSnapshot(userCoinRef, snap => {
      coinBalanceEl.innerText = snap.exists()
        ? parseFloat(snap.data().balance).toFixed(8)
        : "0.00000001";
    });
  } catch (e) {
    console.error("Error loading coin:", e);
    coinNameEl.innerText = "Error loading coin";
    coinIconEl.src = "/public/coins/default-coin.png";
  }
}