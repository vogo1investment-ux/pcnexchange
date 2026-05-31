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

let userEmail = "";

/* GET ELEMENT ONCE */
const box = document.getElementById("emailBox");

/* START STATE */
box.innerText = "Waiting for login...";

/* 🔥 FIXED AUTH HANDLER */
onAuthStateChanged(auth, (user) => {

if (!user) {
box.innerText = "Please login first";
return;
}

/* 🔥 EMAIL IS READY HERE ONLY */
userEmail = user.email || "No email found";

/* UPDATE UI SAFELY */
box.innerText = userEmail;

});

/* COPY EMAIL */
window.copyEmail = function () {

if (!userEmail) {
alert("Email not ready yet");
return;
}

navigator.clipboard.writeText(userEmail);
alert("Email copied!");

};

</script>