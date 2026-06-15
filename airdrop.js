import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc,
setDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange",
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const balanceEl =
document.getElementById("airdropBalance");

const searchBtn =
document.getElementById("searchAirdropsBtn");

const listEl =
document.getElementById("airdropList");

const loadingEl =
document.getElementById("loadingBox");

let currentUser = null;

onAuthStateChanged(auth, async(user)=>{

if(!user){
alert("Login Required");
return;
}

currentUser = user;

await loadBalance();

});

async function loadBalance(){

const userRef =
doc(db,"users",currentUser.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

const data = userSnap.data();

const bal =
Number(data.airdropBalance || 0);

balanceEl.innerText =
bal.toFixed(8);

}

}

searchBtn.addEventListener(
"click",
loadAirdrops
);

async function loadAirdrops(){

loadingEl.style.display = "block";

listEl.innerHTML = "";

try{

const snap =
await getDocs(
collection(db,"airdropCampaigns")
);

loadingEl.style.display = "none";

snap.forEach(docSnap=>{

const d = docSnap.data();

const card =
document.createElement("div");

card.className =
"airdrop-card";

card.innerHTML = `

<h2>${d.name || "Airdrop"}</h2>

<div class="airdrop-info">
Rate:
${Number(d.rate || 0).toFixed(8)}
</div>

<div class="airdrop-info">
Amount:
${d.amount || 0}
</div>

<div class="airdrop-info">
Start:
${new Date(
d.startTime
).toLocaleString()}
</div>

<div class="airdrop-info">
End:
${new Date(
d.endTime
).toLocaleString()}
</div>

<div class="airdrop-buttons">

<button
class="start-btn">
START MINING
</button>

<button
class="stop-btn">
STOP MINING
</button>

</div>

<button
class="withdraw-btn">

WITHDRAW AIRDROP

</button>

`;

listEl.appendChild(card);

const startBtn =
card.querySelector(".start-btn");

const stopBtn =
card.querySelector(".stop-btn");

const withdrawBtn =
card.querySelector(".withdraw-btn");

startBtn.onclick = ()=>{

startMining(
docSnap.id,
d.rate,
d.endTime
);

};

stopBtn.onclick = ()=>{

stopMining();

};

withdrawBtn.onclick = ()=>{

window.location.href =
"withdrawalairdrop.html";

};

});

}catch(err){

loadingEl.style.display = "none";

console.error(err);

}

}

async function startMining(
campaignId,
rate,
endTime
){

const stateRef =
doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

await setDoc(stateRef,{

active:true,

campaignId,

rate,

endTime,

startedAt:Date.now()

});

alert("Mining Started");

runMining();

}

async function stopMining(){

const stateRef =
doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

await setDoc(stateRef,{

active:false

},{merge:true});

alert("Mining Stopped");

}

async function runMining(){

const stateRef =
doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

const stateSnap =
await getDoc(stateRef);

if(!stateSnap.exists())
return;

const state =
stateSnap.data();

if(!state.active)
return;

setInterval(async()=>{

const stateCheck =
await getDoc(stateRef);

if(!stateCheck.exists())
return;

const st =
stateCheck.data();

if(!st.active)
return;

if(Date.now() > st.endTime)
return;

const userRef =
doc(
db,
"users",
currentUser.uid
);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists())
return;

const userData =
userSnap.data();

let balance =
Number(
userData.airdropBalance || 0
);

balance +=
Number(st.rate || 0);

await updateDoc(userRef,{

airdropBalance:balance

});

balanceEl.innerText =
balance.toFixed(8);

},1000);

}

setTimeout(async()=>{

const stateRef =
doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

const snap =
await getDoc(stateRef);

if(
snap.exists() &&
snap.data().active
){

runMining();

}

},1500);