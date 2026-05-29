import {
initializeApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/* FIREBASE CONFIG */
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

/* ADMIN EMAIL (ONLY THIS CAN ACCESS ADMIN) */
const ADMIN_EMAIL = "kingnnachi11@gmail.com";

document.getElementById("loginBtn").onclick = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if (!email || !password) {
alert("Fill all fields");
return;
}

try {

const userCred = await signInWithEmailAndPassword(auth, email, password);
const user = userCred.user;

/* ADMIN CHECK */
if (user.email !== ADMIN_EMAIL) {
alert("You are not allowed to access admin panel");
return;
}

alert("Admin Login Successful");

/* GO TO ADMIN PANEL */
window.location = "admin.html";

} catch (err) {
alert("Login Failed");
console.log(err);
}

};