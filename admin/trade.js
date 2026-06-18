import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
doc,
updateDoc,
getDoc
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

async function loadUsers(){

const usersSnap =
await getDocs(collection(db,"users"));

usersSnap.forEach(userDoc=>{

const option =
document.createElement("option");

option.value = userDoc.id;
option.textContent = userDoc.id;

userSelect.appendChild(option);

});

}

async function loadCoins(){

const coinsSnap =
await getDocs(collection(db,"coins"));

coinsSnap.forEach(coinDoc=>{

const option =
document.createElement("option");

option.value = coinDoc.id;
option.textContent = coinDoc.id;

coinSelect.appendChild(option);

});

}

loadUsers();
loadCoins();

loadRequestsBtn.onclick = async()=>{

requestsContainer.innerHTML="";

const snap =
await getDocs(collection(db,"pendingCoins"));

snap.forEach(docSnap=>{

const d = docSnap.data();

const div =
document.createElement("div");

div.className="request-card";

div.innerHTML=`
<p>User: ${d.userId}</p>
<p>Coin: ${d.coin}</p>
<p>Amount: ${d.amount}</p>
<p>Status: ${d.status}</p>

<button onclick="approveRequest('${docSnap.id}')">
Approve
</button>
`;

requestsContainer.appendChild(div);

});

};

window.approveRequest = async(id)=>{

const requestRef =
doc(db,"pendingCoins",id);

await updateDoc(requestRef,{
status:"approved"
});

alert("Approved");

};

addCoinBtn.onclick = async()=>{

const uid =
userSelect.value;

const coin =
coinSelect.value;

const amount =
parseFloat(
document.getElementById("coinAmount").value
);

if(!uid || !coin || !amount){

alert("Fill all fields");
return;

}

const userRef =
doc(db,"users",uid);

const userSnap =
await getDoc(userRef);

const data =
userSnap.data();

const coins =
data.coins || {};

const current =
parseFloat(coins[coin] || 0);

coins[coin] =
Number(current + amount).toFixed(8);

await updateDoc(userRef,{
coins
});

alert(
`${amount} ${coin} added`
);

};