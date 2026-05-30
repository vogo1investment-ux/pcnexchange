import {
initializeApp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
collection,
query,
where,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

/* FIREBASE CONFIG */
const firebaseConfig = {

apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_ID",
appId: "YOUR_APP_ID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* DOM */
const depositList = document.getElementById("depositList");
const withdrawList = document.getElementById("withdrawList");
const sentList = document.getElementById("sentList");
const receivedList = document.getElementById("receivedList");

onAuthStateChanged(auth, (user) => {

if (!user) {
window.location = "index.html";
return;
}

/* =====================
   DEPOSITS
===================== */
const depositQ = query(
collection(db, "deposits"),
where("userId", "==", user.uid)
);

onSnapshot(depositQ, (snap) => {

depositList.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

depositList.innerHTML += `
<div class="bg-zinc-900 p-3 rounded-lg">
<p>Amount: $${d.amount}</p>
<p>Status: ${d.status || "completed"}</p>
<p>${new Date(d.time || d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

/* =====================
   WITHDRAWALS
===================== */
const withdrawQ = query(
collection(db, "withdrawals"),
where("userId", "==", user.uid)
);

onSnapshot(withdrawQ, (snap) => {

withdrawList.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

withdrawList.innerHTML += `
<div class="bg-zinc-900 p-3 rounded-lg">
<p>Amount: $${d.amount}</p>
<p>Status: ${d.status || "pending"}</p>
<p>${new Date(d.time || d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

/* =====================
   SENT TRANSFERS
===================== */
const sentQ = query(
collection(db, "transferRequests"),
where("senderId", "==", user.uid)
);

onSnapshot(sentQ, (snap) => {

sentList.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

sentList.innerHTML += `
<div class="bg-zinc-900 p-3 rounded-lg">
<p>To: ${d.receiver}</p>
<p>Amount: $${d.amount}</p>
<p>Status: ${d.status}</p>
<p>${new Date(d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

/* =====================
   RECEIVED TRANSFERS
===================== */
const receivedQ = query(
collection(db, "transferRequests"),
where("receiver", "==", user.email)
);

onSnapshot(receivedQ, (snap) => {

receivedList.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

receivedList.innerHTML += `
<div class="bg-zinc-900 p-3 rounded-lg">
<p>From: ${d.senderId}</p>
<p>Amount: $${d.amount}</p>
<p>Status: ${d.status}</p>
<p>${new Date(d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

});