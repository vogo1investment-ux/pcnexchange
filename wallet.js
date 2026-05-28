// wallet.js

import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc
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

document.getElementById(
"withdrawable"
).innerText =
"$" + (data.withdrawableBalance || 0);

document.getElementById(
"referral"
).innerText =
"$" + (data.referralCommission || 0);

document.getElementById(
"cart"
).innerText =
(data.cart || []).length;

document.getElementById(
"refLink"
).value =
window.location.origin +
"/index.html?ref=" +
user.uid;

}

}

/* COPY */

document.getElementById(
"copyBtn"
).onclick=()=>{

navigator.clipboard.writeText(

document.getElementById(
"refLink"
).value

);

alert(
"Referral link copied"
);

};

);