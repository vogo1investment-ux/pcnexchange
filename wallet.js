import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, collection, onSnapshot, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const availableBalanceEl = document.getElementById("availableBalance");
const referralCodeEl = document.getElementById("referralCode");
const referredCountEl = document.getElementById("referredCount");
const referralCommissionEl = document.getElementById("referralCommission");
const cryptoListEl = document.getElementById("cryptoList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  const userRef = doc(db, "users", uid);

  // -------- USER INFO --------
  onSnapshot(userRef, async (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    availableBalanceEl.innerText = parseFloat(data.availableBalance || 0).toFixed(2);
    referralCodeEl.innerText = data.username || uid;
    referralCommissionEl.innerText = parseFloat(data.referralCommission || 0).toFixed(2);

    // Count referred users
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("referredBy", "==", data.username || uid));
    const referredSnap = await getDocs(q);
    referredCountEl.innerText = referredSnap.size;
  });

  // -------- USER COINS --------
  const coinsRef = collection(db, "users", uid, "coins");

  onSnapshot(coinsRef, (snapshot) => {
    cryptoListEl.innerHTML = "";
    if (snapshot.empty) {
      cryptoListEl.innerHTML = "<p>No coins purchased yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const coin = docSnap.data();

      // Fix: use correct field names from your Firestore
      const name = coin.name || coin.coinName || coin.coin || "Unnamed Coin";
      const symbol = coin.symbol || coin.symbolName || "";
      const balance = parseFloat(coin.balance || 0).toFixed(8);

      const div = document.createElement("div");
      div.className = "crypto-card";
      div.innerHTML = `
        <span class="crypto-name">${name} ${symbol ? `(${symbol})` : ""}</span>
        <span class="crypto-balance">${balance}</span>
      `;
      cryptoListEl.appendChild(div);
    });
  });
});