import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
doc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged,
setPersistence,
browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// FIREBASE CONFIG
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

// FORCE SESSION STABILITY
setPersistence(auth, browserLocalPersistence);

// ================= STATE =================
let balance = 0;
let hidden = false;

// ================= TOGGLE BALANCE =================
window.toggleBalance = function () {

const el = document.getElementById("balance");

if (!hidden) {
el.innerText = "******";
} else {
el.innerText = "$" + balance;
}

hidden = !hidden;

};

// ================= CURRENCY =================
const rates = {
USD: 1,
NGN: 1310,
GBP: 0.78,
EUR: 0.92,
CAD: 1.35
};

function convert(currency) {

const converted = balance * rates[currency];

document.getElementById("balance").innerText =
converted.toLocaleString() + " " + currency;

}

// ================= REAL TIME AUTH =================
onAuthStateChanged(auth, (user) => {

if (!user) return;

// 🔥 REAL TIME FIRESTORE LISTENER (IMPORTANT FIX)
const ref = doc(db, "users", user.uid);

onSnapshot(ref, (snap) => {

if (!snap.exists()) return;

const data = snap.data();

// USERNAME FIX
document.getElementById("welcomeUser").innerText =
data.username || data.email || "PCN USER";

// BALANCE FIX (LIVE UPDATE)
balance = data.availableBalance || 0;

document.getElementById("balance").innerText =
"$" + balance;

});

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

</script>