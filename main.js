import {

initializeApp

}

from

"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

getAuth,

createUserWithEmailAndPassword,

signInWithEmailAndPassword,

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

getFirestore,

doc,

setDoc,

getDoc

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

let signupMode=false;

window.openLogin=()=>{

authBox.style.display="flex";

authTitle.innerHTML="LOGIN";

authBtn.innerHTML="LOGIN";

signupMode=false;

};

window.openSignup=()=>{

authBox.style.display="flex";

authTitle.innerHTML="SIGN UP";

authBtn.innerHTML="CREATE ACCOUNT";

signupMode=true;

};

window.closeAuth=()=>{

authBox.style.display="none";

};

authBtn.onclick=

async()=>{

let userEmail=email.value;

let userPassword=password.value;

if(

!userEmail ||

!userPassword

){

alert(

"Fill all fields"

);

return;

}

try{

if(signupMode){

const userCredential=

await createUserWithEmailAndPassword(

auth,

userEmail,

userPassword

);

const user=

userCredential.user;

await setDoc(

doc(

db,

"users",

user.uid

),

{

username:

userEmail.split("@")[0],

availableBalance:0,

withdrawableBalance:0,

referralCommission:0,

joinedUsers:0,

usedReferral:"",

cart:[]

}

);

alert(

"ACCOUNT CREATED"

);

location="dashboard.html";

}

else{

await signInWithEmailAndPassword(

auth,

userEmail,

userPassword

);

alert(

"LOGIN SUCCESS"

);

location="dashboard.html";

}

}

catch(e){

alert(

e.message

);

console.log(e);

}

};

onAuthStateChanged(

auth,

user=>{

if(

user &&

location.pathname.includes(

"index.html"

)

){

console.log(

"USER LOGGED IN"

);

}

}
);