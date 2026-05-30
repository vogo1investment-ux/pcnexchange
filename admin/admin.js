import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const adminApp = document.getElementById("adminApp");

/* SECURITY CHECK */
onAuthStateChanged(auth, async (user) => {

if (!user || localStorage.getItem("admin") !== "true") {
window.location = "adminLogin.html";
return;
}

adminApp.classList.remove("hidden");

/* LOAD USERS */
const snap = await getDocs(collection(db, "users"));

let total = 0;
let html = "";

snap.forEach(u => {
const d = u.data();
total++;

html += `
<div class="userCard">
<p>${d.email || "No Email"}</p>

<input id="bal-${u.id}" value="${d.availableBalance || 0}">

<button onclick="updateBalance('${u.id}')">Update</button>
</div>
`;
});

document.getElementById("usersList").innerHTML = html;
document.getElementById("totalUsers").innerText = total;

});

/* UPDATE BALANCE */
window.updateBalance = async (id) => {

const value = document.getElementById("bal-" + id).value;

await updateDoc(doc(db, "users", id), {
availableBalance: Number(value)
});

alert("Updated Successfully");
};

/* LOGOUT */
document.getElementById("logoutBtn").onclick = async () => {
await signOut(auth);
localStorage.removeItem("admin");
window.location = "adminLogin.html";
};