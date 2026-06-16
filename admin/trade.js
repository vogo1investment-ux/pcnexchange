import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const list = document.getElementById("list");

// ---------------- LOAD REQUESTS ----------------
async function loadRequests() {
list.innerHTML = "Loading...";

const snap = await getDocs(collection(db, "coinRequests"));

list.innerHTML = "";

snap.forEach(docSnap => {
const data = docSnap.data();

const div = document.createElement("div");
div.className = "card";

div.innerHTML = `
<b>User:</b> ${data.userId}<br>
<b>Coin:</b> ${data.coin}<br>
<b>Amount:</b> ${data.amount}<br>
<b>Status:</b> ${data.status || "pending"}<br>

<input type="number" placeholder="Add Coin Amount" id="amt-${docSnap.id}">

<br>

<button class="approve" onclick="approve('${docSnap.id}', '${data.userId}', '${data.coin}')">
Approve
</button>

<button class="reject" onclick="reject('${docSnap.id}')">
Reject
</button>
`;

list.appendChild(div);
});
}

// ---------------- APPROVE ----------------
window.approve = async (id, userId, coin) => {
const amountInput = document.getElementById(`amt-${id}`);
const amount = Number(amountInput.value || 0);

if (!amount) {
alert("Enter coin amount to credit");
return;
}

// 1. update request status
await updateDoc(doc(db, "coinRequests", id), {
status: "approved",
approvedAmount: amount
});

// 2. add coin to user wallet
const coinRef = doc(db, "users", userId, "coins", coin);
const snap = await getDoc(coinRef);

let old = 0;
if (snap.exists()) old = snap.data().balance || 0;

await setDoc(coinRef, {
balance: old + amount
}, { merge: true });

alert("Approved & Coins added!");
loadRequests();
};

// ---------------- REJECT ----------------
window.reject = async (id) => {
await updateDoc(doc(db, "coinRequests", id), {
status: "rejected"
});

alert("Rejected!");
loadRequests();
};

// ---------------- AUTH CHECK ----------------
onAuthStateChanged(auth, (user) => {
if (!user) {
alert("Login required");
return;
}

if (user.uid !== ADMIN_UID) {
alert("Not admin");
return;
}

loadRequests();
});