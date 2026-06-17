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

let currentUser = null;

// ✅ WAIT FOR USER SESSION
onAuthStateChanged(auth, (user) => {
if (!user) {
console.log("No user logged in");
return;
}

currentUser = user;
console.log("User ready:", user.uid);
});

// ---------------- BUTTON ----------------
document.getElementById("submitTransfer").addEventListener("click", async () => {

if (!currentUser) {
alert("Please wait for login session...");
return;
}

const recipient = document.getElementById("recipient").value.trim();
const amount = Number(document.getElementById("amount").value);

if (!recipient || !amount) {
alert("Fill all fields properly");
return;
}

try {

// 🔥 SEND TO FIRESTORE
const id = Date.now().toString();

await setDoc(doc(db, "pendingTransfers", id), {
senderId: currentUser.uid,
recipient,
amount,
status: "pending",
createdAt: serverTimestamp()
});

alert("✅ Transfer submitted successfully!");

document.getElementById("recipient").value = "";
document.getElementById("amount").value = "";
document.getElementById("password").value = "";

} catch (error) {
console.error(error);
alert("❌ Failed to submit transfer");
}
});