import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
onAuthStateChanged
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

appId:"1:1018307795636:web:6545b94e234fe9fb1ad5e1",

measurementId:"G-W9M358ZS1G"

};

const app=
initializeApp(firebaseConfig);

const auth=
getAuth(app);

const db=
getFirestore(app);

const coins=[

{
name:"BTC",
price:"$72,981.69",
change:"-2.89%"
},

{
name:"ETH",
price:"$1,983.19",
change:"-3.99%"
},

{
name:"BNB",
price:"$631.41",
change:"-3.22%"
},

{
name:"XRP",
price:"$1.29",
change:"-2.45%"
},

{
name:"USDT",
price:"$1.00",
change:"+0.01%"
}

];

coins.forEach(c=>{

coins.innerHTML+=`

<div class="coin">

<div>

<h2>

${c.name}

</h2>

</div>

<div>

<h2>

${c.price}

</h2>

</div>

<div class="${
c.change.includes('-')
?'red'
:'green'
}">

${c.change}

</div>

</div>

`;

});

let mode="login";

window.openLogin=()=>{

authBox.style.display="flex";

authTitle.innerHTML="LOGIN";

authBtn.innerHTML="LOGIN";

mode="login";

};

window.openSignup=()=>{

authBox.style.display="flex";

authTitle.innerHTML="SIGN UP";

authBtn.innerHTML="CREATE ACCOUNT";

mode="signup";

};

window.closeAuth=()=>{

authBox.style.display="none";

};

authBtn.onclick=async()=>{

if(mode=="login"){

try{

await signInWithEmailAndPassword(

auth,

email.value,

password.value

);

location="dashboard.html";

}

catch(e){

alert("LOGIN FAILED");

}

}else{

try{

let userCredential=

await createUserWithEmailAndPassword(

auth,

email.value,

password.value

);

await setDoc(

doc(
db,
"users",
userCredential.user.uid
),

{

email:
email.value,

availableBalance:0,

withdrawableBalance:0,

referralCommission:0,

joinedUsers:0,

cart:[]

}

);

location="dashboard.html";

}

catch(e){

alert("SIGNUP FAILED");

}

}

};

onAuthStateChanged(

auth,

user=>{

if(user){

console.log(
"LOGGED IN"
);

}

}
);