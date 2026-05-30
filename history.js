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

/* FIREBASE CONFIG (use your PCN config) */
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

/* UI ELEMENTS */
const sentBox = document.getElementById("sentList");
const receivedBox = document.getElementById("receivedList");

onAuthStateChanged(auth, (user) => {

if (!user) {
window.location = "index.html";
return;
}

/* =========================
   TRANSFERS (SENT)
========================= */
const transferQuery = query(
collection(db, "transferRequests"),
where("senderId", "==", user.uid)
);

onSnapshot(transferQuery, (snap) => {

sentBox.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

sentBox.innerHTML += `
<div style="background:#111;padding:10px;margin-bottom:8px;border-radius:8px">
<p><b>Transfer To:</b> ${d.receiver}</p>
<p><b>Amount:</b> $${d.amount}</p>
<p><b>Status:</b> ${d.status}</p>
<p style="color:gray">${new Date(d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

/* =========================
   TRANSFERS (RECEIVED)
========================= */
const receiveQuery = query(
collection(db, "transferRequests"),
where("receiver", "==", user.email)
);

onSnapshot(receiveQuery, (snap) => {

receivedBox.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

receivedBox.innerHTML += `
<div style="background:#111;padding:10px;margin-bottom:8px;border-radius:8px">
<p><b>From:</b> ${d.senderId}</p>
<p><b>Amount:</b> $${d.amount}</p>
<p><b>Status:</b> ${d.status}</p>
<p style="color:gray">${new Date(d.createdAt).toLocaleString()}</p>
</div>
`;

});

});

});