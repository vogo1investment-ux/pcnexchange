import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

setTimeout(initTrades,500);

async function initTrades(){

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

if(
!requestsContainer ||
!userSelect ||
!coinSelect ||
!addCoinBtn ||
!loadRequestsBtn
){
console.error("Trades page not loaded");
return;
}

await loadUsers();
await loadCoins();

loadRequestsBtn.addEventListener(
"click",
loadRequests
);

addCoinBtn.addEventListener(
"click",
addCoin
);

async function loadUsers(){

userSelect.innerHTML =
'<option value="">Select User</option>';

const usersSnap =
await getDocs(collection(db,"users"));

usersSnap.forEach(userDoc=>{

const option =
document.createElement("option");

option.value =
userDoc.id;

option.textContent =
userDoc.id;

userSelect.appendChild(option);

});

}

async function loadCoins(){

coinSelect.innerHTML =
'<option value="">Select Coin</option>';

const coinsSnap =
await getDocs(collection(db,"coins"));

coinsSnap.forEach(coinDoc=>{

const option =
document.createElement("option");

option.value =
coinDoc.id;

option.textContent =
coinDoc.id;

coinSelect.appendChild(option);

});

}

async function loadRequests(){

requestsContainer.innerHTML =
"Loading requests...";

const snap =
await getDocs(collection(db,"pendingCoins"));

requestsContainer.innerHTML="";

if(snap.empty){

requestsContainer.innerHTML =
"No pending requests.";

return;
}

snap.forEach(docSnap=>{

const d =
docSnap.data();

const div =
document.createElement("div");

div.className =
"request-card";

div.innerHTML = `

<p><b>User:</b> ${d.userId || ""}</p>
<p><b>Coin:</b> ${d.coin || ""}</p>
<p><b>Amount:</b> ${d.amount || 0}</p>
<p><b>Status:</b> ${d.status || "pending"}</p>
`;const approveBtn =
document.createElement("button");

approveBtn.textContent =
"Approve";

approveBtn.addEventListener(
"click",
async()=>{

try{

await updateDoc(
doc(db,"pendingCoins",docSnap.id),
{
status:"approved"
}
);

alert("Approved");

loadRequests();

}catch(err){

console.error(err);

alert("Approval failed");

}

}
);

div.appendChild(
approveBtn
);

requestsContainer.appendChild(
div
);

});

}

async function addCoin(){

const uid =
userSelect.value;

const coin =
coinSelect.value;

const amount =
parseFloat(
document.getElementById("coinAmount").value
);

if(
!uid ||
!coin ||
isNaN(amount)
){
alert("Fill all fields");
return;
}

try{

const userRef =
doc(db,"users",uid);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists()){

alert("User not found");

return;
}

const data =
userSnap.data();

const coins =
data.coins || {};

const current =
parseFloat(
coins[coin] || 0
);

coins[coin] =
Number(
current + amount
).toFixed(8);

await updateDoc(
userRef,
{
coins:coins
}
);

message.innerText =
amount +
" " +
coin +
" added successfully";

}catch(err){

console.error(err);

message.innerText =
"Failed to add coin";

}

}

}