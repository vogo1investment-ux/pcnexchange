import {
initializeApp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {

apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_ID",
appId: "YOUR_APP_ID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let walletID = "";

/* SIMPLE QR */
function drawQR(text) {

const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 200;
canvas.height = 200;

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, 200, 200);

ctx.fillStyle = "#00ff88";
ctx.font = "12px Arial";
ctx.fillText("WALLET:", 60, 90);
ctx.fillText(text, 20, 120);

}

onAuthStateChanged(auth, async (user) => {

if (!user) {
window.location = "index.html";
return;
}

try {

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

if (snap.exists()) {

const data = snap.data();

document.getElementById("userEmail").innerText =
data.email || "No email found";

document.getElementById("walletId").innerText =
data.uid || "No wallet ID";

walletID = data.uid;

drawQR(walletID);

} else {

document.getElementById("userEmail").innerText =
"User not found";

document.getElementById("walletId").innerText =
"Error loading wallet";

}

} catch (e) {

console.log(e);

document.getElementById("userEmail").innerText =
"Error loading data";

document.getElementById("walletId").innerText =
"Check Firebase connection";

}

});

/* COPY */
window.copyWallet = function () {

if (!walletID) {
alert("Wallet not ready yet");
return;
}

navigator.clipboard.writeText(walletID);

alert("Wallet ID copied");

};