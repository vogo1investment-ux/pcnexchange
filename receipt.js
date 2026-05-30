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

const receiptList = document.getElementById("receiptList");

onAuthStateChanged(auth, (user) => {

if (!user) {
window.location = "index.html";
return;
}

const q = query(
collection(db, "transferRequests"),
where("receiver", "==", user.email)
);

onSnapshot(q, (snap) => {

receiptList.innerHTML = "";

snap.forEach(doc => {

const d = doc.data();

if (d.status === "approved") {

receiptList.innerHTML += `
<div class="bg-zinc-900 p-3 rounded-lg">
<p><b>From:</b> ${d.senderId}</p>
<p><b>Amount:</b> $${d.amount}</p>
<p><b>Time:</b> ${new Date(d.createdAt).toLocaleString()}</p>
</div>
`;

}

});

});

});