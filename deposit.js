import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getAuth,
onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
getFirestore,
collection,
addDoc,
serverTimestamp,
doc,
getDoc
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);

/* ELEMENTS */

const amount =
document.getElementById("amount");

const submitBtn =
document.getElementById("submitDeposit");

/* USER */

let currentUser = null;

let currentUsername = "PCN USER";

/* AUTH */

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location = "index.html";

return;

}

currentUser = user;

/* GET USERNAME */

try{

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

if(snap.exists()){

currentUsername =
snap.data().username || "PCN USER";

}

}catch(err){

console.log(err);

}

});

/* SUBMIT */

submitBtn.onclick = async()=>{

if(!currentUser){

alert("Please login");

return;

}

const depositAmount =
amount.value.trim();

if(!depositAmount){

alert("Enter amount");

return;

}

try{

/* SAVE DEPOSIT */

await addDoc(

collection(db,"transactions"),

{

uid: currentUser.uid,

username: currentUsername,

type: "deposit",

amount: Number(depositAmount),

status: "pending",

createdAt: Date.now(),

timestamp: serverTimestamp()

}

);

alert("Deposit Submitted Successfully");

amount.value = "";

}catch(err){

console.log(err);

alert("Failed To Submit Deposit");

}

};