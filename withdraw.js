import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, collection, addDoc, arrayUnion, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

let userUid = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUid = user.uid;
});

document.getElementById("submitWithdraw").addEventListener("click", async () => {
  const amount = Number(document.getElementById("withdrawAmount").value);
  const recipient = document.getElementById("recipient").value.trim();
  const region = document.getElementById("regionSelect").value;
  const method = document.getElementById("methodSelect").value;

  if (!userUid) return alert("User not authenticated");
  if (!region) return alert("Select your region");
  if (!method) return alert("Select a payment method");
  if (!amount || amount <= 0) return alert("Enter a valid amount");
  if (!recipient) return alert("Enter recipient details");

  try {
    const userRef = doc(db, "users", userUid);
    const transRef = collection(db, "users", userUid, "transactions");

    const newTrans = {
      type: "withdraw",
      amount,
      region,
      method,
      to: recipient,
      timestamp: Date.now(),
      status: "pending"
    };

    // Add to subcollection
    await addDoc(transRef, newTrans);

    // Optional: Add to array in user doc
    await updateDoc(userRef, {
      transactions: arrayUnion(newTrans)
    });

    alert("Withdrawal request submitted! Status: pending");
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("recipient").value = "";
    document.getElementById("regionSelect").value = "";
    document.getElementById("methodSelect").value = "";

  } catch (err) {
    console.error(err);
    alert("Failed to submit withdrawal.");
  }
});