import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const marketList = document.getElementById("marketList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, async (snapshot) => {
    if (snapshot.empty) {
      marketList.innerHTML = "<p>No coins available.</p>";
      return;
    }

    marketList.innerHTML = "";

    snapshot.forEach(async (docSnap) => {
      const coin = docSnap.data();
      coin.id = docSnap.id;

      // Fetch lastPrice from Firestore if exists
      const coinRef = doc(db, "coins", coin.id);
      const coinDocSnap = await getDoc(coinRef);
      const lastPrice = coinDocSnap.exists() && coinDocSnap.data().lastPrice !== undefined
        ? coinDocSnap.data().lastPrice
        : coin.price;

      // Determine price indicator color
      let priceColor = "blue";
      if (coin.price > lastPrice) priceColor = "green";
      else if (coin.price < lastPrice) priceColor = "red";

      // Update lastPrice in Firestore for next comparison
      await setDoc(coinRef, { lastPrice: coin.price }, { merge: true });

      // Create coin card
      const div = document.createElement("div");
      div.className = "market-card";
      div.innerHTML = `
        <img src="${coin.iconUrl || 'default-coin.png'}" class="coin-icon">
        <h3>${coin.name} (${coin.symbol})</h3>
        <p style="color:${priceColor}">Price: $${coin.price}</p>
        <p>${coin.description || "No description available."}</p>
      `;

      // Navigate to coin page on click
      div.addEventListener("click", () => {
        window.location.href = `coin.html?coin=${coin.id}`;
      });

      marketList.appendChild(div);
    });
  });
});