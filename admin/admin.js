import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "YOUR_KEY",
authDomain: "YOUR_DOMAIN",
projectId: "YOUR_PROJECT",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_ID",
appId: "YOUR_APP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const adminApp = document.getElementById("adminApp");

// SECURITY CHECK
onAuthStateChanged(auth, async (user) => {

if (!user || localStorage.getItem("admin") !== "true") {
window.location = "adminLogin.html";
return;
}

adminApp.classList.remove("hidden");

// LOAD USERS
const snap = await getDocs(collection(db, "users"));

let totalUsers = 0;
let html = "";

snap.forEach(docu => {
const d = docu.data();
totalUsers++;

html += `
<div class="userCard">
<p>${d.email || "No Email"}</p>

<input value="${d.availableBalance || 0}" id="bal-${docu.id}">

<button onclick="updateBalance('${docu.id}')">Update</button>
</div>
`;
});

document.getElementById("usersList").innerHTML = html;
document.getElementById("totalUsers").innerText = totalUsers;

});

// UPDATE BALANCE
window.updateBalance = async (id) => {

const value = document.getElementById("bal-" + id).value;

await updateDoc(doc(db, "users", id), {
availableBalance: Number(value)
});

alert("Updated");
};

// LOGOUT
document.getElementById("logoutBtn").onclick = async () => {
await signOut(auth);
localStorage.removeItem("admin");
window.location = "adminLogin.html";
};