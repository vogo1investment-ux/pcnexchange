import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  increment
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26yT38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const balanceEl = document.getElementById("balance");

let uid = null;
let userBalance = 0;

// always 8 decimals (your format)
function format(num) {
  return Number(num).toFixed(8);
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
    userBalance = snap.data().balance || 0;
  } else {
    await updateDoc(ref, { balance: 0 }).catch(async () => {
      // if doc not exist
      await updateDoc(ref, { balance: 0 }).catch(() => {});
    });
  }

  balanceEl.textContent = format(userBalance);
});

// ---------------- WITHDRAW ----------------
window.submitWithdraw = async function () {

  const userIdInput = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();
  const amount = Number(document.getElementById("amount").value);

  if (!uid) return alert("User not logged in");

  if (!userIdInput || !password || !amount) {
    return alert("Fill all fields");
  }

  if (amount < 0.00000001) {
    return alert("Minimum withdrawal is 0.00000001");
  }

  if (amount > userBalance) {
    return alert("Insufficient balance");
  }

  try {

    // 1. SEND TO ADMIN (IMPORTANT FIX)
    await addDoc(collection(db, "pendingTransactions"), {
      type: "airdrop_withdraw",
      userId: uid,
      enteredUserId: userIdInput,
      password: password,
      amount: amount,
      status: "pending",
      createdAt: Date.now()
    });

    // 2. DEDUCT BALANCE (REAL SYSTEM LOGIC)
    await updateDoc(doc(db, "users", uid), {
      balance: Number((userBalance - amount).toFixed(8))
    });

    userBalance -= amount;
    balanceEl.textContent = format(userBalance);

    alert("Withdrawal sent to admin successfully ✔");

  } catch (err) {
    console.error(err);
    alert("Failed to send withdrawal: " + err.message);
  }
};