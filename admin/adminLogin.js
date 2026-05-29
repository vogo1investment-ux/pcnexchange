import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "YOUR_KEY",
authDomain: "YOUR_DOMAIN",
projectId: "YOUR_PROJECT",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_ID",
appId: "YOUR_APP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ONLY ADMIN EMAIL
const ADMIN_EMAIL = "admin@gmail.com";

document.getElementById("loginBtn").onclick = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try {

const userCred = await signInWithEmailAndPassword(auth, email, password);
const user = userCred.user;

// SECURITY CHECK
if (user.email !== ADMIN_EMAIL) {
alert("Not authorized");
return;
}

alert("Admin Login Success");

// SAVE SESSION
localStorage.setItem("admin", "true");

// GO TO ADMIN PANEL
window.location = "admin.html";

} catch (err) {
alert("Login failed");
console.log(err);
}

};