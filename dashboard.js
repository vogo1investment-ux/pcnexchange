import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { useAuth } from "./core-auth.js";

// ================= FIREBASE CONFIG =================

const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_SENDER_ID",
appId: "YOUR_APP_ID"
};

// ================= INIT APP =================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================

let balanceValue = 0;
let hidden = false;

// ================= BALANCE TOGGLE =================

window.toggleBalance = function () {

const el = document.getElementById("balance");

if (!hidden) {
el.innerText = "******";
} else {
el.innerText = "$" + balanceValue;
}

hidden = !hidden;

};

// ================= CURRENCY =================

const rates = {
USD: 1,
NGN: 1310,
GBP: 0.74,
EUR: 0.86,
CAD: 1.37
};

function convert(currency) {

const value = balanceValue * rates[currency];

document.getElementById("balance").innerText =
value.toLocaleString() + " " + currency;

}

// ================= AUTH =================

useAuth(async (user) => {

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

if (snap.exists()) {

const data = snap.data();

balanceValue = data.availableBalance || 0;

document.getElementById("welcomeUser").innerText =
data.username || "PCN USER";

document.getElementById("balance").innerText =
"$" + balanceValue;

}

});

// ================= CURRENCY EVENT =================

document.addEventListener("DOMContentLoaded", () => {

const select = document.getElementById("currencySelect");

if (select) {

select.addEventListener("change", (e) => {
convert(e.target.value);
});

}

});