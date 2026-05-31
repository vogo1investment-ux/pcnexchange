<script type="module">

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

let uid = "";

/* 🔥 FIX: PREVENT LOADING STUCK */
const box = document.getElementById("uidBox");
box.innerHTML = "Waiting for wallet...";

/* SAFE AUTH HANDLING */
onAuthStateChanged(auth, (user) => {

if (!user) {
box.innerHTML = "Wallet not available";
return;
}

uid = user.uid;

/* 🔥 FIX: INSTANT UPDATE (NO LOADING BUG) */
box.innerHTML = `
<div class="uid-box">
${uid}
</div>
`;

});

/* COPY FUNCTION */
window.copyUID = function () {

if (!uid) {
alert("Wallet not ready yet");
return;
}

navigator.clipboard.writeText(uid);
alert("UID copied!");

};

</script>