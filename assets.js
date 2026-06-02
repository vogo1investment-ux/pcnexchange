import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const assetsList = document.getElementById("assetsList");

// Ensure the user is logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Fetch all coins from top-level collection "coins"
  const coinsRef = collection(db, "coins");

  onSnapshot(coinsRef, snapshot => {
    if (snapshot.empty) {
      assetsList.innerHTML = "<p>No coins found.</p>";
      return;
    }

    assetsList.innerHTML = ""; // Clear placeholder

    snapshot.forEach(doc => {
      const coin = doc.data();
      const div = document.createElement("div");
      div.className = "bg-zinc-800 p-4 rounded mb-2";
      div.innerHTML = `
        <h3 style="color:#0f0;">${coin.name} (${coin.symbol})</h3>
        <p>Balance: ${coin.balance || 0}</p>
        <p>Price: ${coin.price || 0}</p>
        <p>Description: ${coin.description || "No description"}</p>
      `;
      assetsList.appendChild(div);
    });
  });
});