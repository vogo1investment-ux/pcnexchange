import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

let uid;
let balance = 0;

const balanceEl = document.getElementById("balance");

// FORMAT 8 DECIMALS
function format(n){
  return Number(n).toFixed(8);
}

// LOAD USER BALANCE
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    balance = snap.data().balance || 0;
  }

  balanceEl.textContent = format(balance);
});

// SUBMIT WITHDRAWAL
window.submitWithdraw = async function () {

  const userIdInput = document.getElementById("userId").value;
  const password = document.getElementById("password").value;
  const amount = Number(document.getElementById("amount").value);

  if (!userIdInput || !password || !amount) {
    alert("Please fill all fields");
    return;
  }

  if (amount > balance) {
    alert("Insufficient balance");
    return;
  }

  try {

    await addDoc(collection(db, "pendingWithdrawals"), {
      userId: uid,
      enteredUserId: userIdInput,
      password: password,
      amount: amount,
      status: "Pending",
      type: "airdrop_withdraw",
      createdAt: new Date()
    });

    alert("Withdrawal request sent successfully!");

    document.getElementById("userId").value = "";
    document.getElementById("password").value = "";
    document.getElementById("amount").value = "";

  } catch (err) {
    console.error(err);
    alert("Withdrawal failed");
  }
};