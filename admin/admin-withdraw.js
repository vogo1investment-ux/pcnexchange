import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc,
getDoc
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

const withdrawList = document.getElementById("withdrawList");

/* AUTH CHECK */
onAuthStateChanged(auth, async (user) => {

if (!user || localStorage.getItem("adminLoggedIn") !== "true") {
window.location = "admin-login.html";
return;
}

const snap = await getDocs(collection(db, "transactions"));

snap.forEach((docSnap) => {

const d = docSnap.data();

if (d.type !== "withdraw") return;

withdrawList.innerHTML += `
<div class="bg-zinc-900 p-4 mb-3 rounded-xl border border-zinc-800">

<p>User: ${d.uid}</p>
<p>Amount: $${d.amount}</p>
<p>Status: ${d.status}</p>

<p>Bank: ${d.bankName || "-"}</p>
<p>Account: ${d.accountNumber || "-"}</p>
<p>Name: ${d.accountName || "-"}</p>

<button onclick="approveWithdraw('${docSnap.id}','${d.uid}','${d.amount}')"
class="bg-green-500 text-black px-4 py-2 rounded mt-2">

Approve

</button>

<button onclick="rejectWithdraw('${docSnap.id}')"
class="bg-red-500 text-black px-4 py-2 rounded mt-2">

Reject

</button>

</div>
`;

});

});

/* APPROVE WITHDRAWAL */
window.approveWithdraw = async (id, uid, amount) => {

const userRef = doc(db, "users", uid);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {

let bal = userSnap.data().availableBalance || 0;

bal -= Number(amount);

if (bal < 0) bal = 0;

await updateDoc(userRef, {
availableBalance: bal
});

}

await updateDoc(doc(db, "transactions", id), {
status: "approved"
});

alert("Withdrawal Approved");
location.reload();

};

/* REJECT WITHDRAWAL */
window.rejectWithdraw = async (id) => {

await updateDoc(doc(db, "transactions", id), {
status: "rejected"
});

alert("Withdrawal Rejected");
location.reload();

};