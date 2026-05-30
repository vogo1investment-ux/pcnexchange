import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {

/* USE YOUR PCN EXCHANGE CONFIG HERE */

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

const auth =
getAuth(app);

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location =
"index.html";

return;

}

sendBtn.onclick =
async()=>{

const receiver =
document.getElementById(
"receiver"
).value.trim();

const amount =
Number(
document.getElementById(
"amount"
).value
);

if(!receiver || amount <= 0){

alert(
"Fill all fields"
);

return;

}

try{

await addDoc(

collection(
db,
"transferRequests"
),

{

senderId:user.uid,

receiver:receiver,

amount:amount,

status:"pending",

createdAt:Date.now()

}

);

alert(
"Transfer submitted for approval"
);

document.getElementById(
"receiver"
).value = "";

document.getElementById(
"amount"
).value = "";

}

catch(error){

console.log(error);

alert(
"Transfer failed"
);

}

};

}
);