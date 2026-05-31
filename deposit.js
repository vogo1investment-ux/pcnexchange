import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// FIREBASE CONFIG
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

const submitBtn = document.getElementById("submitDeposit");
const amountInput = document.getElementById("amount");
const proofInput = document.getElementById("proof");

let currentUserUid = null;

// Wait for user login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to make a deposit.");
    window.location.href = "index.html";
    return;
  }
  currentUserUid = user.uid;
});

// SUBMIT DEPOSIT
submitBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid deposit amount.");
    return;
  }

  // Optional: get proof file
  const proofFile = proofInput.files[0];
  let proofName = proofFile ? proofFile.name : null;

  try {
    if (!currentUserUid) {
      alert("User not loaded yet. Try again.");
      return;
    }

    // === Option 1: Save as subcollection transaction ===
    const transRef = collection(db, "users", currentUserUid, "transactions");

    await addDoc(transRef, {
      type: "deposit",
      amount: amount,
      timestamp: Date.now(),
      proofFileName: proofName || null
    });

    // === Option 2: Also save in transactions array inside user doc ===
    const userRef = doc(db, "users", currentUserUid);
    await updateDoc(userRef, {
      transactions: arrayUnion({
        type: "deposit",
        amount: amount,
        timestamp: Date.now(),
        proofFileName: proofName || null
      })
    });

    alert("Deposit submitted successfully!");
    amountInput.value = "";
    proofInput.value = "";

  } catch (error) {
    console.error("Error submitting deposit:", error);
    alert("Failed to submit deposit. See console for details.");
  }
});