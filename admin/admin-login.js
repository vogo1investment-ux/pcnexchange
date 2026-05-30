import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange",
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").onclick = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if (!email || !password) {
alert("Fill all fields");
return;
}

try {

await signInWithEmailAndPassword(auth, email, password);

/* 🔥 IMPORTANT FIX */
localStorage.setItem("adminLoggedIn", "true");

alert("Login Successful");

window.location.href = "admin-dashboard.html";

} catch (err) {
console.log(err);
alert("Login Failed");
}

};