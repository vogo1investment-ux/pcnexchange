// market.js

import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc,
updateDoc
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

/* MARKET DATA */

const coins = [

{
name:"Bitcoin",
symbol:"BTC",
price:"67,245",
change:"+2.5%",
icon:"₿"
},

{
name:"Ethereum",
symbol:"ETH",
price:"3,521",
change:"+1.2%",
icon:"Ξ"
},

{
name:"Solana",
symbol:"SOL",
price:"149",
change:"-0.8%",
icon:"S"
},

{
name:"BNB",
symbol:"BNB",
price:"598",
change:"+4.1%",
icon:"B"
},

{
name:"XRP",
symbol:"XRP",
price:"0.58",
change:"+0.9%",
icon:"X"
},

{
name:"DOGE",
symbol:"DOGE",
price:"0.14",
change:"-1.1%",
icon:"D"
}

];

const marketBox =
document.getElementById(
"marketBox"
);

/* LOAD MARKET */

coins.forEach(

coin=>{

marketBox.innerHTML += `

<div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">

<div class="flex items-center justify-between">

<div class="flex items-center gap-4">

<div class="w-14 h-14 bg-emerald-500 text-black rounded-2xl flex items-center justify-center text-2xl font-bold">

${coin.icon}

</div>

<div>

<h2 class="text-2xl font-bold">

${coin.symbol}

</h2>

<p class="text-zinc-400">

${coin.name}

</p>

</div>

</div>

<div class="${
coin.change.includes('+')
?
'text-emerald-500'
:
'text-red-500'
} font-bold">

${coin.change}

</div>

</div>

<div class="mt-6">

<h1 class="text-4xl font-bold">

$${coin.price}

</h1>

</div>

<div class="grid grid-cols-2 gap-4 mt-6">

<button
class="buyBtn bg-emerald-500 text-black py-4 rounded-2xl font-bold"
data-coin="${coin.symbol}">

BUY

</button>

<button
class="sellBtn bg-zinc-800 text-white py-4 rounded-2xl font-bold"
data-coin="${coin.symbol}">

SELL

</button>

</div>

</div>

`;

});

/* AUTH */

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location =
"index.html";

return;

}

/* BUY BUTTON */

document.querySelectorAll(
".buyBtn"
).forEach(

btn=>{

btn.onclick =
async()=>{

const coin =
btn.dataset.coin;

try{

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

let userData =
userSnap.data();

let cart =
userData.cart || [];

cart.push(
coin
);

await updateDoc(

userRef,

{
cart:cart
}

);

alert(
coin + " added to cart"
);

}

}
catch(e){

console.log(e);

alert(
"Error adding to cart"
);

}

};

}

);

/* SELL BUTTON */

document.querySelectorAll(
".sellBtn"
).forEach(

btn=>{

btn.onclick =
()=>{

alert(
"Sell system coming soon"
);

};

}

);

}
);