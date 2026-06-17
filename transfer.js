import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 🔥 YOUR FIREBASE CONFIG (PCNEXCHANGE)
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// INIT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI BUTTON
const btn = document.getElementById("submitTransfer");

btn.addEventListener("click", async () => {

  const recipient = document.getElementById("recipient").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const password = document.getElementById("password").value;

  const user = auth.currentUser;

  if (!user) {
    alert("You are not logged in");
    return;
  }

  if (!recipient || amount <= 0) {
    alert("Enter valid recipient and amount");
    return;
  }

  try {
    btn.innerText = "Processing...";

    await addDoc(collection(db, "pendingTransactions"), {
      userId: user.uid,          // REQUIRED BY YOUR RULE
      targetUserId: recipient,   // receiver
      amount: amount,
      type: "transfer",
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("Transfer submitted successfully!");

    document.getElementById("recipient").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("password").value = "";

  } catch (error) {
    console.error(error);
    alert("Transfer failed: " + error.message);
  }

  btn.innerText = "Send Transfer";
});