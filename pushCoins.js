import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// Admin password trigger
const adminPassword = prompt("Enter admin password to push coins:");

if(adminPassword === "123456"){  // <-- your secret password
  fetch("coins_with_descriptions.json")
    .then(res => res.json())
    .then(async coins => {
      for(const coin of coins){
        await setDoc(doc(db,"coins",coin.symbol), coin);
        console.log("Coin pushed:", coin.symbol);
      }
      alert("All coins pushed to Firebase!");
    })
    .catch(err => console.error(err));
} else {
  alert("Incorrect password. Cannot push coins.");
}