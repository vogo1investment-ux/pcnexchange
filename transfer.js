import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, collection, addDoc, updateDoc, arrayUnion, getDoc, increment } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
setPersistence(auth, browserLocalPersistence);

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
});

const recipientInput = document.getElementById("recipient");
const amountInput = document.getElementById("amount");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitTransfer");

submitBtn.addEventListener("click", async () => {
  const recipient = recipientInput.value.trim();
  const amount = Number(amountInput.value);
  const password = passwordInput.value;

  if (!recipient || !amount || amount <= 0 || !password) return alert("Please fill all fields correctly.");

  try {
    // Re-authenticate sender
    await signInWithEmailAndPassword(auth, currentUser.email, password);

    const senderRef = doc(db, "users", currentUser.uid);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data();

    if (!senderData || (senderData.availableBalance || 0) < amount) {
      return alert("Insufficient balance.");
    }

    // Deduct sender balance
    await updateDoc(senderRef, {
      availableBalance: senderData.availableBalance - amount
    });

    // Determine recipient UID if they entered email
    let recipientUid = recipient;
    if (recipient.includes("@")) {
      // Search by email
      const usersRef = collection(db, "users");
      const querySnapshot = await getDoc(doc(db, "users", recipient)); // You may implement a query by email here
      if (!querySnapshot.exists()) return alert("Recipient not found.");
      recipientUid = querySnapshot.id;
    }

    // Create transaction (pending)
    const transferTx = {
      type: "transfer",
      amount,
      to: recipient,
      from: currentUser.uid,
      timestamp: Date.now(),
      status: "pending"
    };

    // Add to sender subcollection and array
    const senderTransRef = collection(db, "users", currentUser.uid, "transactions");
    await addDoc(senderTransRef, transferTx);
    await updateDoc(senderRef, { transactions: arrayUnion(transferTx) });

    alert("Transfer submitted! Status: pending until approved.");

    // Clear inputs
    recipientInput.value = "";
    amountInput.value = "";
    passwordInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Failed to submit transfer: " + err.message);
  }
});