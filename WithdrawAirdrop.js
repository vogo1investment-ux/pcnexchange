import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let uid = null;
let balance = 0;

const balanceEl = document.getElementById("balance");

// format 8 decimals
function format(n) {
  return Number(n || 0).toFixed(8);
}

// ---------------- LOAD USER ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    balance = snap.data().airdropBalance || 0;
  }

  balanceEl.textContent = format(balance);
});

// ---------------- WITHDRAW SYSTEM ----------------
window.submitWithdraw = async function () {
  try {
    const userIdInput = document.getElementById("userId").value;
    const password = document.getElementById("password").value;
    const amount = Number(document.getElementById("amount").value);

    if (!uid) return alert("Not logged in");
    if (!amount || amount <= 0) return alert("Invalid amount");
    if (amount > balance) return alert("Insufficient balance");

    // create withdrawal request for admin
    await addDoc(collection(db, "pendingWithdrawals"), {
      userId: uid,
      userInputId: userIdInput,
      password: password,
      amount: amount,
      status: "pending",
      createdAt: serverTimestamp()
    });

    // deduct from airdrop balance immediately (pending lock)
    balance -= amount;

    await updateDoc(doc(db, "users", uid), {
      airdropBalance: balance
    });

    balanceEl.textContent = format(balance);

    alert("Withdrawal request sent successfully");

  } catch (err) {
    console.error(err);
    alert("Failed to send withdrawal");
  }
};