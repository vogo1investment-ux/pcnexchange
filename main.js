// main.js

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

const app = initializeApp(
firebaseConfig
);

const auth = getAuth(
app
);

const db = getFirestore(
app
);

/* CREATE AUTH POPUP */

const authBox = document.createElement(
"div"
);

authBox.innerHTML = `

<div id="authModal"
style="
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:rgba(0,0,0,0.85);
display:none;
justify-content:center;
align-items:center;
z-index:99999;
padding:20px;
">

<div
style="
background:#111;
padding:35px;
border-radius:30px;
width:100%;
max-width:420px;
color:white;
">

<h2
style="
font-size:32px;
margin-bottom:25px;
color:#00ff88;
font-weight:bold;
">

PCN LOGIN

</h2>

<input
id="email"
type="email"
placeholder="Email"
style="
width:100%;
padding:18px;
margin-bottom:15px;
border:none;
border-radius:18px;
background:#1a1a1a;
color:white;
font-size:16px;
">

<input
id="password"
type="password"
placeholder="Password"
style="
width:100%;
padding:18px;
margin-bottom:20px;
border:none;
border-radius:18px;
background:#1a1a1a;
color:white;
font-size:16px;
">

<button
id="loginBtn"
style="
width:100%;
padding:18px;
background:#00ff88;
border:none;
border-radius:20px;
font-size:18px;
font-weight:bold;
color:black;
margin-bottom:15px;
">

Login

</button>

<button
id="signupBtn"
style="
width:100%;
padding:18px;
background:white;
border:none;
border-radius:20px;
font-size:18px;
font-weight:bold;
color:black;
">

Create Account

</button>

<button
id="closeAuth"
style="
width:100%;
padding:15px;
margin-top:15px;
background:red;
border:none;
border-radius:18px;
font-weight:bold;
color:white;
">

Close

</button>

</div>

</div>

`;

document.body.appendChild(
authBox
);

/* OPEN AUTH */

function openAuth(){

document.getElementById(
"authModal"
).style.display="flex";

}

/* CLOSE AUTH */

document.getElementById(
"closeAuth"
).onclick=()=>{

document.getElementById(
"authModal"
).style.display="none";

};

/* CONNECT BUTTONS */

document.querySelectorAll(
"a"
).forEach(

btn=>{

if(

btn.innerText.includes(
"Login"
)

||

btn.innerText.includes(
"Get Started"
)

||

btn.innerText.includes(
"Start Trading"
)

){

btn.addEventListener(

"click",

e=>{

e.preventDefault();

openAuth();

}

);

}

}

);

/* SIGNUP */

document.getElementById(
"signupBtn"
).onclick=

async()=>{

try{

const email=

document.getElementById(
"email"
).value;

const password=

document.getElementById(
"password"
).value;

const userCredential=

await createUserWithEmailAndPassword(

auth,

email,

password

);

const user=
userCredential.user;

/* SAVE USER */

await setDoc(

doc(
db,
"users",
user.uid
),

{

username:
"PCN USER",

availableBalance:0,

withdrawableBalance:0,

referralCommission:0,

joinedUsers:0,

cart:[],

createdAt:
Date.now()

}

);

alert(
"ACCOUNT CREATED"
);

window.location=
"dashboard.html";

}

catch(e){

alert(
e.message
);

}

};

/* LOGIN */

document.getElementById(
"loginBtn"
).onclick=

async()=>{

try{

const email=

document.getElementById(
"email"
).value;

const password=

document.getElementById(
"password"
).value;

await signInWithEmailAndPassword(

auth,

email,

password

);

alert(
"LOGIN SUCCESS"
);

window.location=
"dashboard.html";

}

catch(e){

alert(
e.message
);

}

};

/* SESSION */

onAuthStateChanged(

auth,

user=>{

if(

user

&&

window.location.pathname.includes(
"index.html"
)

){

console.log(
"USER LOGGED IN"
);

}

}
);