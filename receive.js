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

/* UI */
const box = document.getElementById("walletBox");
box.innerText = "Loading wallet...";

/* 🔥 FIXED AUTH FLOW */
function render(user){

if (!user) return;

/* GET UID FIRST */
const uid = user.uid;
const email = user.email;

/* FINAL WALLET VALUE */
wallet = uid || email;

/* SHOW ONLY WHEN READY */
box.innerText = wallet;

}

/* WAIT FOR AUTH */
onAuthStateChanged(auth, (user) => {

/* ONLY CALL RENDER WHEN FIREBASE IS READY */
if (user) {
render(user);
}

});

/* COPY FUNCTION */
window.copyWallet = function () {

if (!wallet) {
alert("Wallet not ready yet");
return;
}

navigator.clipboard.writeText(wallet);
alert("Wallet copied!");

};

</script>