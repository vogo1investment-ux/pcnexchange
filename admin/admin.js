import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {

apiKey:
"AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",

authDomain:
"pcnexchange.firebaseapp.com",

databaseURL:
"https://pcnexchange-default-rtdb.firebaseio.com",

projectId:
"pcnexchange",

storageBucket:
"pcnexchange.firebasestorage.app",

messagingSenderId:
"278761036604",

appId:
"1:278761036604:web:a02e2d2ac7a9379d6f9c39"

};

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);

/* AUTH */

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location =
"../index.html";

return;

}

loadUsers();
loadTransactions();
loadKyc();

}

);

/* LOGOUT */

document.getElementById(
"logoutBtn"
).onclick = async()=>{

await signOut(auth);

window.location =
"../index.html";

};

/* USERS */

async function loadUsers(){

const snap =
await getDocs(collection(db,"users"));

const usersBox =
document.getElementById("usersBox");

usersBox.innerHTML = "";

let total = 0;

snap.forEach((docSnap)=>{

total++;

const data =
docSnap.data();

usersBox.innerHTML += `

<div class="user-card">

<h3>${data.username || "No Username"}</h3>

<p>${data.email}</p>

<p>Balance: $${data.availableBalance || 0}</p>

</div>

`;

});

document.getElementById(
"totalUsers"
).innerText = total;

}

/* TRANSACTIONS */

async function loadTransactions(){

const snap =
await getDocs(collection(db,"transactions"));

const depositBox =
document.getElementById("depositBox");

const withdrawBox =
document.getElementById("withdrawBox");

depositBox.innerHTML = "";
withdrawBox.innerHTML = "";

let totalDeposits = 0;
let totalWithdrawals = 0;

snap.forEach((docSnap)=>{

const data =
docSnap.data();

if(data.type === "deposit"){

totalDeposits += Number(data.amount);

depositBox.innerHTML += `

<div class="deposit-card">

<h3>$${data.amount}</h3>

<p>Status: ${data.status}</p>

</div>

`;

}

if(data.type === "withdraw"){

totalWithdrawals += Number(data.amount);

withdrawBox.innerHTML += `

<div class="withdraw-card">

<h3>$${data.amount}</h3>

<p>Status: ${data.status}</p>

</div>

`;

}

});

document.getElementById(
"totalDeposits"
).innerText =
"$"+totalDeposits;

document.getElementById(
"totalWithdrawals"
).innerText =
"$"+totalWithdrawals;

}

/* KYC */

async function loadKyc(){

const snap =
await getDocs(collection(db,"users"));

const kycBox =
document.getElementById("kycBox");

kycBox.innerHTML = "";

let pending = 0;

snap.forEach((docSnap)=>{

const data =
docSnap.data();

if(data.kycStatus === "pending"){

pending++;

kycBox.innerHTML += `

<div class="kyc-card">

<h3>${data.username}</h3>

<p>KYC Pending</p>

<button onclick="approveKyc('${docSnap.id}')">

Approve

</button>

</div>

`;

}

});

document.getElementById(
"pendingKyc"
).innerText = pending;

}

/* APPROVE */

window.approveKyc = async(uid)=>{

await updateDoc(doc(db,"users",uid),{

kycVerified:true,
kycStatus:"approved"

});

alert("KYC Approved");

loadKyc();

};