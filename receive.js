import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange",
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let wallet = "";

/* 🔥 IMPORTANT: WAIT STATE CONTROL */
const box = document.getElementById("walletBox");

/* START LOADING STATE */
box.innerText = "Connecting wallet...";

/* SAFE AUTH HANDLER (FIXED TIMING ISSUE) */
onAuthStateChanged(auth, (user) => {

/* IF STILL NOT READY */
if (!user) {
return; // DO NOTHING (prevents fake "not available")
}

/* GET WALLET */
wallet =
user.uid ||
user.email;

/* UPDATE UI ONLY WHEN READY */
if (wallet) {
box.innerText = wallet;
} else {
box.innerText = "Wallet not found";
}

});

/* COPY FUNCTION */
window.copyWallet = function () {

if (!wallet) return;

navigator.clipboard.writeText(wallet);

alert("Wallet copied!");

};

</script>