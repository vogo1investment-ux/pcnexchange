import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const db = getFirestore(app);

const auth = getAuth(app);

/* LOAD USER DATA */

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href = "index.html";

return;

}

try{

const userRef = doc(db,"users",user.uid);

const snap = await getDoc(userRef);

if(snap.exists()){

const data = snap.data();

/* MAIN BALANCE */

document.getElementById("balance").innerText =
"$" + (data.availableBalance || 0);

/* WITHDRAWABLE */

document.getElementById("withdrawable").innerText =
"$" + (data.withdrawableBalance || 0);

/* REFERRAL */

document.getElementById("referral").innerText =
"$" + (data.referralCommission || 0);

/* CART */

document.getElementById("cart").innerText =
data.joinedUsers || 0;

/* REF LINK */

const refInput =
document.getElementById("refLink");

if(refInput){

refInput.value =
window.location.origin +
"/index.html?ref=" +
user.uid;

}

}

}catch(err){

console.log(err);

}

});

/* COPY BUTTON */

const copyBtn =
document.getElementById("copyBtn");

if(copyBtn){

copyBtn.onclick = ()=>{

const refInput =
document.getElementById("refLink");

refInput.select();

document.execCommand("copy");

copyBtn.innerText = "COPIED";

setTimeout(()=>{

copyBtn.innerText = "COPY";

},2000);

};

}