import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc,
updateDoc,
setDoc
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const requestsContainer =
document.getElementById("requestsContainer");

const userSelect =
document.getElementById("userSelect");

const coinSelect =
document.getElementById("coinSelect");

const addCoinBtn =
document.getElementById("addCoinBtn");

const loadRequestsBtn =
document.getElementById("loadRequestsBtn");

const message =
document.getElementById("message");

loadUsers();
loadCoins();

loadRequestsBtn.onclick =
loadRequests;

addCoinBtn.onclick =
addCoinManually;

async function loadUsers(){

const snap =
await getDocs(collection(db,"users"));

userSelect.innerHTML =
'<option value="">Select User</option>';

snap.forEach(d=>{

userSelect.innerHTML +=
`<option value="${d.id}">
${d.id}

</option>`;});

}

async function loadCoins(){

const snap =
await getDocs(collection(db,"coins"));

coinSelect.innerHTML =
'<option value="">Select Coin</option>';

snap.forEach(d=>{

coinSelect.innerHTML +=
`<option value="${d.id}">
${d.id}

</option>`;});

}

async function loadRequests(){

requestsContainer.innerHTML =
"Loading...";

const snap =
await getDocs(
collection(db,"pendingTransactions")
);

requestsContainer.innerHTML="";

snap.forEach(d=>{

const data =
d.data();

if(data.status !== "pending")
return;

const div =
document.createElement("div");

div.className="request";

div.innerHTML=`

<p>User:
${data.userId}</p><p>Coin:
${data.coinId}</p><p>Amount:
${data.amount}</p><p>Status:
${data.status}</p><button class="approve"
onclick="approveRequest(
'${d.id}',
'${data.userId}',
'${data.coinId}',
${data.amount}
)">
Approve
</button>

`;

requestsContainer.appendChild(div);

});

}

window.approveRequest =
async function(
requestId,
userId,
coinId,
amount
){

try{

const coinRef =
doc(
db,
"users",
userId,
"coins",
coinId
);

const coinSnap =
await getDoc(coinRef);

let currentBalance = 0;

if(coinSnap.exists()){

currentBalance =
parseFloat(
coinSnap.data().balance || 0
);

}

await setDoc(
coinRef,
{
balance:
Number(
currentBalance +
parseFloat(amount)
).toFixed(8)
},
{merge:true}
);

await updateDoc(
doc(
db,
"pendingTransactions",
requestId
),
{
status:"approved"
}
);

alert("Approved");

loadRequests();

}catch(error){

console.error(error);

alert(error.message);

}

};

async function addCoinManually(){

const uid =
userSelect.value;

const coin =
coinSelect.value;

const amount =
parseFloat(
document.getElementById(
"coinAmount"
).value
);

if(
!uid ||
!coin ||
isNaN(amount)
){

alert("Fill all fields");

return;

}

const coinRef =
doc(
db,
"users",
uid,
"coins",
coin
);

const coinSnap =
await getDoc(coinRef);

let current = 0;

if(coinSnap.exists()){

current =
parseFloat(
coinSnap.data().balance || 0
);

}

await setDoc(
coinRef,
{
balance:
Number(
current + amount
).toFixed(8)
},
{merge:true}
);

message.innerText =
"Coin Added Successfully";

}