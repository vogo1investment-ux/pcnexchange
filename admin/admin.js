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
updateDoc,
addDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {

apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",

authDomain: "pcnexchange.firebaseapp.com",

databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",

projectId: "pcnexchange",

storageBucket: "pcnexchange.firebasestorage.app",

messagingSenderId: "278761036604",

appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ADMIN LOGIN */

onAuthStateChanged(auth, async(user)=>{

if(!user){
window.location = "../index.html";
return;
}

loadUsers();
loadTransactions();
loadKyc();

});

/* LOGOUT */

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = async()=>{
await signOut(auth);
window.location = "../index.html";
};

/* USERS */

async function loadUsers(){

const usersSnap = await getDocs(collection(db,"users"));

let totalUsers = 0;

const usersBox = document.getElementById("usersBox");
usersBox.innerHTML = "";

usersSnap.forEach(async(userDoc)=>{

const data = userDoc.data();

totalUsers++;

usersBox.innerHTML += `
<div class="user-card">
<h3>${data.username || "No Username"}</h3>
<p>${data.email}</p>
<p>Balance: $${data.availableBalance || 0}</p>

<input type="number" id="bal-${userDoc.id}" placeholder="Edit Balance">

<button onclick="window.updateBalance('${userDoc.id}')">
Update Balance
</button>

</div>
`;

});

document.getElementById("totalUsers").innerText = totalUsers;

}

/* UPDATE BALANCE */

window.updateBalance = async(uid)=>{

const amount = document.getElementById(`bal-${uid}`).value;

if(!amount){
alert("Enter Amount");
return;
}

await updateDoc(doc(db,"users",uid),{
availableBalance:Number(amount),
withdrawableBalance:Number(amount)
});

alert("Balance Updated");

loadUsers();

};

/* TRANSACTIONS */

async function loadTransactions(){

const transSnap = await getDocs(collection(db,"transactions"));

let totalDeposits = 0;
let totalWithdrawals = 0;

const depositBox = document.getElementById("depositBox");
const withdrawBox = document.getElementById("withdrawBox");

depositBox.innerHTML = "";
withdrawBox.innerHTML = "";

transSnap.forEach(async(transDoc)=>{

const data = transDoc.data();

if(data.type === "deposit"){

totalDeposits += Number(data.amount);

depositBox.innerHTML += `
<div class="deposit-card">
<h3>$${data.amount}</h3>
<p>Status: ${data.status}</p>
<button onclick="window.approveDeposit('${transDoc.id}','${data.uid}','${data.amount}')">
Approve Deposit
</button>
</div>
`;

}

if(data.type === "withdraw"){

totalWithdrawals += Number(data.amount);

withdrawBox.innerHTML += `
<div class="withdraw-card">
<h3>$${data.amount}</h3>
<p>${data.bankName || ""}</p>
<p>Status: ${data.status}</p>
<button onclick="window.approveWithdraw('${transDoc.id}')">
Approve Withdrawal
</button>
</div>
`;

}

});

document.getElementById("totalDeposits").innerText = "$" + totalDeposits;

document.getElementById("totalWithdrawals").innerText = "$" + totalWithdrawals;

}

/* APPROVE DEPOSIT */

window.approveDeposit = async(transId,uid,amount)=>{

const userRef = doc(db,"users",uid);

await updateDoc(userRef,{
availableBalance:Number(amount),
withdrawableBalance:Number(amount)
});

await updateDoc(doc(db,"transactions",transId),{
status:"success"
});

alert("Deposit Approved");

loadTransactions();
loadUsers();

};

/* APPROVE WITHDRAW */

window.approveWithdraw = async(transId)=>{

await updateDoc(doc(db,"transactions",transId),{
status:"success"
});

alert("Withdrawal Approved");

loadTransactions();

};

/* KYC */

async function loadKyc(){

const usersSnap = await getDocs(collection(db,"users"));

const kycBox = document.getElementById("kycBox");
kycBox.innerHTML = "";

let pending = 0;

usersSnap.forEach(async(userDoc)=>{

const data = userDoc.data();

if(data.kycStatus === "pending"){

pending++;

kycBox.innerHTML += `
<div class="kyc-card">
<h3>${data.username}</h3>
<p>KYC Pending</p>
<button onclick="window.verifyUser('${userDoc.id}')">
Approve KYC
</button>
</div>
`;

}

});

document.getElementById("pendingKyc").innerText = pending;

}

/* VERIFY USER */

window.verifyUser = async(uid)=>{

await updateDoc(doc(db,"users",uid),{
kycVerified:true,
kycStatus:"approved"
});

alert("KYC Approved");

loadKyc();

};

/* SEND NOTIFICATION */

document.getElementById("sendNotificationBtn").onclick = async()=>{

const text = document.getElementById("notificationText").value;

if(!text){
alert("Enter Message");
return;
}

await addDoc(collection(db,"notifications"),{
message:text,
createdAt:Date.now()
});

alert("Notification Sent");

document.getElementById("notificationText").value = "";

};