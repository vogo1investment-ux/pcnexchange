import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
doc,
getDoc,
setDoc,
updateDoc,
serverTimestamp
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

// ---------------- BUTTON ----------------
const btn = document.getElementById("submitTransfer");

onAuthStateChanged(auth, async (user) => {

if (!user) {
console.log("Waiting for login session...");
return; // ❌ DO NOT REDIRECT HERE
}

console.log("User logged in:", user.uid);

// ---------------- TRANSFER ACTION ----------------
btn.addEventListener("click", async () => {

const recipient = document.getElementById("recipient").value;
const amount = Number(document.getElementById("amount").value);
const password = document.getElementById("password").value;

if (!recipient || !amount) {
alert("Fill all fields");
return;
}

// 🔥 CREATE TRANSFER REQUEST
await setDoc(doc(db, "pendingTransfers", Date.now().toString()), {
senderId: user.uid,
recipient,
amount,
status: "pending",
createdAt: serverTimestamp()
});

alert("Transfer submitted for admin approval!");
});
});