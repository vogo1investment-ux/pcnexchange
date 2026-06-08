import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const uploadBtn = document.getElementById("uploadBtn");
const statusDiv = document.getElementById("status");

uploadBtn.addEventListener("click", async () => {
  statusDiv.innerText = "Uploading coins...";

  try {
    // Fetch the JSON file from the project folder
    const res = await fetch("coins_with_icons.json");
    const coins = await res.json();

    let successCount = 0;
    for (const coin of coins) {
      try {
        const coinRef = doc(collection(db, "coins"), coin.symbol);
        await setDoc(coinRef, coin);
        successCount++;
      } catch (err) {
        console.error("Failed to upload coin:", coin.symbol, err);
      }
    }

    statusDiv.innerText = `Upload complete: ${successCount}/${coins.length} coins uploaded successfully!`;
  } catch (err) {
    console.error("Failed to fetch or parse JSON:", err);
    statusDiv.innerText = "Failed to load coins JSON.";
  }
});