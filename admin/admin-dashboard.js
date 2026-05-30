import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged,
signOut
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
const db = getFirestore(app);
const auth = getAuth(app);

const panel = document.getElementById("adminPanel");

/* AUTH + SECURITY */
onAuthStateChanged(auth, async (user) => {

if (!user || localStorage.getItem("adminLoggedIn") !== "true") {
window.location = "admin-login.html";
return;
}

panel.classList.remove("hidden");

/* LOAD USERS */
const usersSnap = await getDocs(collection(db, "users"));
const txSnap = await getDocs(collection(db, "transactions"));

let users = 0;
let deposits = 0;
let withdrawals = 0;
let pending = 0;

let html = "";

/* USERS LOOP */
usersSnap.forEach((docSnap) => {
users++;
const d = docSnap.data();

html += `
<div class="userCard">
<div>
<p>${d.email || "No Email"}</p>
</div>

<input id="bal-${docSnap.id}" value="${d.availableBalance || 0}">

<button onclick="updateBalance('${docSnap.id}')">Update</button>
</div>
`;
});

/* TRANSACTIONS LOOP */
txSnap.forEach((docSnap) => {
const d = docSnap.data();

if (d.type === "deposit") deposits += Number(d.amount || 0);
if (d.type === "withdraw") withdrawals += Number(d.amount || 0);
if (d.status === "pending") pending++;
});

/* UPDATE UI */
document.getElementById("users").innerText = users;
document.getElementById("deposits").innerText = "$" + deposits;
document.getElementById("withdrawals").innerText = "$" + withdrawals;
document.getElementById("pending").innerText = pending;

document.getElementById("userList").innerHTML = html;

});

/* UPDATE BALANCE */
window.updateBalance = async (id) => {

const value = document.getElementById("bal-" + id).value;

await updateDoc(doc(db, "users", id), {
availableBalance: Number(value)
});

alert("Balance Updated");
};

/* LOGOUT */
window.logout = async () => {
await signOut(auth);
localStorage.removeItem("adminLoggedIn");
window.location = "admin-login.html";
};