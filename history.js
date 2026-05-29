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
query,
where,
getDocs
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* NEW PCN FIREBASE */

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

const historyList =
document.getElementById("historyList");

/* LOAD HISTORY */

onAuthStateChanged(auth, async(user)=>{

if(!user){

historyList.innerHTML = `
<p class="text-red-400">
Please login first
</p>
`;

return;

}

try{

const q = query(

collection(db,"transactions"),

where("uid","==",user.uid)

);

const snap =
await getDocs(q);

/* EMPTY */

if(snap.empty){

historyList.innerHTML = `

<div class="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 text-center">

<p class="text-zinc-500">

No transactions yet

</p>

</div>

`;

return;

}

/* CLEAR */

historyList.innerHTML = "";

/* SHOW DATA */

snap.forEach(doc=>{

const t = doc.data();

historyList.innerHTML += `

<div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">

<p class="text-emerald-400 font-bold">

${t.type ? t.type.toUpperCase() : "TRANSACTION"}

</p>

<p>

Amount: $${t.amount || 0}

</p>

<p class="text-zinc-500 text-sm">

${t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}

</p>

<p class="text-xs ${t.status === 'success'
? 'text-green-400'
: 'text-yellow-400'}">

${t.status || "pending"}

</p>

</div>

`;

});

}catch(err){

console.log(err);

historyList.innerHTML = `

<p class="text-red-400">

Failed to load history

</p>

`;

}

});