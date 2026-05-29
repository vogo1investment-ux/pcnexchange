// main.js

import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {

apiKey:
"AIzaSyBp3K3gJtK2XqIm-eVI1osP-Vma3wj1lTs",

authDomain:
"jumiastaff-83757.firebaseapp.com",

projectId:
"jumiastaff-83757",

storageBucket:
"jumiastaff-83757.appspot.com",

messagingSenderId:
"1018307795636",

appId:
"1:1018307795636:web:6545b94e234fe9fb1ad5e1",

measurementId:
"G-W9M358ZS1G"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* AUTH POPUP */

const authBox = document.createElement("div");

authBox.innerHTML = `
<div id="authModal"
style="
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:rgba(0,0,0,0.85);
display:none;
justify-content:center;
align-items:center;
z-index:99999;
padding:20px;
">

<div style="
background:#111;
padding:35px;
border-radius:30px;
width:100%;
max-width:420px;
color:white;
border:1px solid #1f1f1f;
">

<h2 style="
font-size:32px;
margin-bottom:25px;
color:#00ff88;
font-weight:bold;
">
PCN LOGIN
</h2>

<input id="username" type="text" placeholder="Username"
style="width:100%;padding:18px;margin-bottom:15px;border:none;border-radius:18px;background:#1a1a1a;color:white;">

<input id="email" type="email" placeholder="Email"
style="width:100%;padding:18px;margin-bottom:15px;border:none;border-radius:18px;background:#1a1a1a;color:white;">

<input id="password" type="password" placeholder="Password"
style="width:100%;padding:18px;margin-bottom:20px;border:none;border-radius:18px;background:#1a1a1a;color:white;">

<button id="loginBtn"
style="width:100%;padding:18px;background:#00ff88;border:none;border-radius:20px;font-weight:bold;">
Login
</button>

<button id="signupBtn"
style="width:100%;padding:18px;background:white;border:none;border-radius:20px;font-weight:bold;">
Create Account
</button>

<button id="closeAuth"
style="width:100%;padding:15px;margin-top:15px;background:red;border:none;border-radius:18px;color:white;">
Close
</button>

</div>
</div>
`;

document.body.appendChild(authBox);

/* OPEN POPUP */

function openAuth(){
document.getElementById("authModal").style.display = "flex";
}

/* CLOSE */

document.getElementById("closeAuth").onclick = () => {
document.getElementById("authModal").style.display = "none";
};

/* BUTTON TRIGGERS */

document.querySelectorAll(".auth-open, a").forEach(btn => {
btn.addEventListener("click", e => {
if (
btn.innerText.includes("Login") ||
btn.innerText.includes("Get Started") ||
btn.innerText.includes("Start Trading")
) {
e.preventDefault();
openAuth();
}
});
});

/* SIGNUP */

document.getElementById("signupBtn").onclick = async () => {

try {

const username = document.getElementById("username").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if (!username || !email || !password) {
alert("Fill all fields");
return;
}

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

await setDoc(doc(db, "users", user.uid), {
username: username,
email: email,
availableBalance: 0,
withdrawableBalance: 0,
referralCommission: 0,
joinedUsers: 0,
createdAt: Date.now()
});

alert("ACCOUNT CREATED SUCCESSFULLY");
window.location = "dashboard.html";

} catch (e) {
alert(e.message);
console.error(e);
}

};

/* LOGIN */

document.getElementById("loginBtn").onclick = async () => {

try {

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if (!email || !password) {
alert("Fill all fields");
return;
}

await signInWithEmailAndPassword(auth, email, password);

alert("LOGIN SUCCESSFUL");
window.location = "dashboard.html";

} catch (e) {
alert(e.message);
console.error(e);
}

};

/* LOAD USER */

onAuthStateChanged(auth, async (user) => {

if (user) {

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

if (snap.exists()) {

const data = snap.data();

const welcomeUser = document.getElementById("welcomeUser");
if (welcomeUser) welcomeUser.innerText = data.username;

const balance = document.getElementById("balance");
if (balance) balance.innerText = "$" + data.availableBalance;

}

}

});

/* LOGOUT */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
logoutBtn.onclick = async () => {
await signOut(auth);
window.location = "index.html";
};
}