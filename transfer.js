import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
doc,
setDoc,
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

let userReady = null;

// 🔥 WAIT FOR AUTH PROPERLY
onAuthStateChanged(auth, (user) => {
if (user) {
userReady = user;
console.log("User loaded:", user.uid);
} else {
userReady = null;
}
});

// ---------------- BUTTON ----------------
document.getElementById("submitTransfer").addEventListener("click", async () => {

try {

if (!userReady) {
alert("⚠️ Please wait, user not logged in yet");
return;
}

const recipient = document.getElementById("recipient").value.trim();
const amount = Number(document.getElementById("amount").value);

if (!recipient || !amount) {
alert("Fill all fields");
return;
}

const id = Date.now().toString();

// 🔥 WRITE TO FIRESTORE
await setDoc(doc(db, "pendingTransfers", id), {
senderId: userReady.uid,
recipient,
amount,
status: "pending",
createdAt: serverTimestamp()
});

alert("✅ Transfer submitted successfully!");

} catch (error) {
console.error("Transfer error:", error);
alert("❌ Failed: " + error.message);
}

});