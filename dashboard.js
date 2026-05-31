import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged,
setPersistence,
browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ---------------- FIREBASE CONFIG ----------------

const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_SENDER_ID",
appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- FIX SESSION PERSISTENCE ----------------

setPersistence(auth, browserLocalPersistence);

// ---------------- GLOBAL STATE ----------------

let realBalance = 0;
let hidden = false;

// ---------------- BALANCE TOGGLE ----------------

window.toggleBalance = function () {

const bal = document.getElementById("balance");

if (!hidden) {
bal.innerText = "******";
} else {
bal.innerText = "$" + realBalance;
}

hidden = !hidden;

};

// ---------------- CURRENCY SYSTEM ----------------

const rates = {
USD: 1,
NGN: 1310,
GBP: 0.74,
EUR: 0.86,
CAD: 1.37
};

function updateCurrency(currency) {

const converted = realBalance * rates[currency];

document.getElementById("balance").innerText =
converted.toLocaleString() + " " + currency;

}

// ---------------- AUTH STATE ----------------

onAuthStateChanged(auth, async (user) => {

if (!user) {
console.log("Waiting for user session...");

// delay redirect to prevent logout bug
setTimeout(() => {

if (!auth.currentUser) {
window.location = "index.html";
}

}, 1500);

return;
}

// ---------------- LOAD USER DATA ----------------

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

if (snap.exists()) {

const data = snap.data();

realBalance = data.availableBalance || 0;

document.getElementById("welcomeUser").innerText =
data.username || "PCN USER";

document.getElementById("balance").innerText =
"$" + realBalance;

}

});

// ---------------- CURRENCY CHANGE ----------------

document.addEventListener("DOMContentLoaded", () => {

const select = document.getElementById("currencySelect");

if (select) {

select.addEventListener("change", (e) => {

updateCurrency(e.target.value);

});

}

});