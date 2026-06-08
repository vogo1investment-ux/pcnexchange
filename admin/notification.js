import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const statusDiv = document.getElementById("status");

let coinsData = null;

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return alert("Please select a JSON file!");
  
  const text = await file.text();
  try {
    coinsData = JSON.parse(text);
    statusDiv.innerText = `Loaded ${coinsData.length} coins from file.`;
  } catch (err) {
    alert("Invalid JSON file!");
    console.error(err);
  }
});

uploadBtn.addEventListener("click", async () => {
  if (!coinsData) return alert("No coins loaded. Please select JSON file first.");
  
  onAuthStateChanged(auth, async user => {
    if (!user) return alert("Please log in to upload coins.");
    
    let uploaded = 0;
    for (const coin of coinsData) {
      try {
        const coinRef = doc(db, "coins", coin.symbol);
        await setDoc(coinRef, {
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          prevPrice: coin.prevPrice,
          description: coin.description,
          iconUrl: coin.iconUrl || "",  // Make sure your JSON has iconUrl field
        });
        uploaded++;
        statusDiv.innerText = `Uploaded ${uploaded} of ${coinsData.length} coins...`;
      } catch (err) {
        console.error(`Failed to upload ${coin.symbol}:`, err);
      }
    }
    statusDiv.innerText = `Upload complete! ${uploaded} coins uploaded successfully.`;
  });
});