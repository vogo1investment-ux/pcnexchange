// trade.js

import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc,
updateDoc,
collection,
addDoc,
query,
where,
onSnapshot
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

/* FIREBASE */

const firebaseConfig = {

apiKey:
"AIzaSyBp3K3gJtK2XqIm-eVI1osP-Vma3wj1lTs",

authDomain:
"jumiastaff-83757.firebaseapp.com",

projectId:
"jumiastaff-83757",

storageBucket:
"jumiastaff-83757.firebasestorage.app",

messagingSenderId:
"1018307795636",

appId:
"1:1018307795636:web:6545b94e234fe9fb1ad5e1",

measurementId:
"G-W9M358ZS1G"

};

const app =
initializeApp(
firebaseConfig
);

const db =
getFirestore(
app
);

const auth =
getAuth(
app
);

/* USER */

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location =
"index.html";

return;

}

const userRef =
doc(
db,
"users",
user.uid
);

const userSnap =
await getDoc(
userRef
);

if(userSnap.exists()){

const data =
userSnap.data();

document.getElementById(
"balance"
).innerText =
"$" + (data.availableBalance || 0);

}

/* BUY */

buyBtn.onclick =
async()=>{

const amount =
Number(
document.getElementById(
"amount"
).value
);

const coin =
document.getElementById(
"coinSelect"
).value;

if(amount <= 0){

alert(
"Enter amount"
);

return;

}

const snap =
await getDoc(
userRef
);

const data =
snap.data();

let balance =
data.availableBalance || 0;

if(balance < amount){

alert(
"Insufficient balance"
);

return;

}

balance -= amount;

await updateDoc(

userRef,

{

availableBalance:balance

}

);

await addDoc(

collection(
db,
"trades"
),

{

userId:user.uid,

coin:coin,

amount:amount,

type:"BUY",

time:Date.now()

}

);

document.getElementById(
"balance"
).innerText =
"$" + balance;

alert(
"Trade successful"
);

};

/* SELL */

sellBtn.onclick =
async()=>{

const amount =
Number(
document.getElementById(
"amount"
).value
);

const coin =
document.getElementById(
"coinSelect"
).value;

if(amount <= 0){

alert(
"Enter amount"
);

return;

}

const snap =
await getDoc(
userRef
);

const data =
snap.data();

let balance =
data.availableBalance || 0;

balance += amount;

await updateDoc(

userRef,

{

availableBalance:balance

}

);

await addDoc(

collection(
db,
"trades"
),

{

userId:user.uid,

coin:coin,

amount:amount,

type:"SELL",

time:Date.now()

}

);

document.getElementById(
"balance"
).innerText =
"$" + balance;

alert(
"Sell successful"
);

};

/* HISTORY */

const q =
query(

collection(
db,
"trades"
),

where(
"userId",
"==",
user.uid
)

);

onSnapshot(

q,

snap=>{

historyList.innerHTML = "";

snap.forEach(

x=>{

const d =
x.data();

historyList.innerHTML += `

<div class="trade-history">

<div>

<h3>

${d.coin} ${d.type}

</h3>

<p>

${new Date(d.time).toLocaleString()}

</p>

</div>

<b class="${
d.type=="BUY"
?
'red'
:
'green'
}">

$${d.amount}

</b>

</div>

`;

}

);

}

);

}
);