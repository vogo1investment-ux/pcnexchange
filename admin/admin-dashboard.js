import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

onAuthStateChanged(auth, async (user) => {

if (!user) {
window.location = "admin-login.html";
return;
}

/* 🔥 FIXED ADMIN CHECK */
if (localStorage.getItem("adminLoggedIn") !== "true") {
alert("Not allowed to access admin panel");
window.location = "admin-login.html";
return;
}

panel.classList.remove("hidden");

/* LOAD USERS */
const snap = await getDocs(collection(db, "users"));

let html = "";
let count = 0;

snap.forEach(u => {
count++;
const d = u.data();

html += `
<div class="card">
<p>${d.email || "No Email"}</p>

<input id="bal-${u.id}" value="${d.availableBalance || 0}">

<button onclick="updateBalance('${u.id}')">Update</button>
</div>
`;
});

document.getElementById("userList").innerHTML = html;
document.getElementById("users").innerText = count;

});

/* UPDATE BALANCE */
window.updateBalance = async (id) => {

const val = document.getElementById("bal-" + id).value;

await updateDoc(doc(db, "users", id), {
availableBalance: Number(val)
});

alert("Updated Successfully");
};