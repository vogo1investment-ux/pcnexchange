import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig={

apiKey:"AIzaSyBp3K3gJtK2XqIm-eVI1osP-Vma3wj1lTs",

authDomain:"jumiastaff-83757.firebaseapp.com",

projectId:"jumiastaff-83757",

storageBucket:"jumiastaff-83757.firebasestorage.app",

messagingSenderId:"1018307795636",

appId:"1:1018307795636:web:6545b94e234fe9fb1ad5e1"

};

const app=
initializeApp(firebaseConfig);

const auth=
getAuth(app);

const db=
getFirestore(app);

/* SIGN UP */

const signupBtn=
document.getElementById(
"signupBtn"
);

if(signupBtn){

signupBtn.onclick=
async()=>{

const username=
document.getElementById(
"signupUsername"
).value;

const email=
document.getElementById(
"signupEmail"
).value;

const password=
document.getElementById(
"signupPassword"
).value;

if(!username || !email || !password){

alert(
"Fill all fields"
);

return;

}

try{

const userCredential=
await createUserWithEmailAndPassword(

auth,
email,
password

);

const user=
userCredential.user;

await setDoc(

doc(db,"users",user.uid),

{

username:username,

email:email,

availableBalance:0,

createdAt:Date.now()

}

);

alert(
"Account Created Successfully"
);

window.location=
"dashboard.html";

}

catch(error){

alert(
error.message
);

}

};

}

/* LOGIN */

const loginBtn=
document.getElementById(
"loginBtn"
);

if(loginBtn){

loginBtn.onclick=
async()=>{

const email=
document.getElementById(
"loginEmail"
).value;

const password=
document.getElementById(
"loginPassword"
).value;

if(!email || !password){

alert(
"Fill all fields"
);

return;

}

try{

await signInWithEmailAndPassword(

auth,
email,
password

);

alert(
"Login Successful"
);

window.location=
"dashboard.html";

}

catch(error){

alert(
error.message
);

}

};

}