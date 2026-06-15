import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
updateDoc,
collection,
getDocs
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

let currentUser = null;
let miningInterval = null;

// UI ELEMENTS
const balanceEl = document.getElementById("airdropBalance");
const searchBtn = document.getElementById("searchAirdropsBtn");
const listEl = document.getElementById("airdropList");
const loadingEl = document.getElementById("loadingBox");

// LOGIN CHECK
onAuthStateChanged(auth, async (user) => {

if (!user) return;

currentUser = user;

await initUserBalance();

await checkAutoMining();

});

// INIT BALANCE (START ALWAYS FROM ZERO IF NOT EXIST)
async function initUserBalance() {

const ref = doc(db, "users", currentUser.uid);
const snap = await getDoc(ref);

if (!snap.exists()) {

await setDoc(ref, {
airdropBalance: 0.00000000
});

balanceEl.innerText = "0.00000000";

return;
}

const data = snap.data();

let bal = parseFloat(data.airdropBalance || 0);

if (isNaN(bal)) bal = 0;

balanceEl.innerText = bal.toFixed(8);

}

// SEARCH AIRDROPS
searchBtn.addEventListener("click", async () => {

loadingEl.style.display = "block";
listEl.innerHTML = "";

const snap = await getDocs(collection(db, "airdropCampaigns"));

loadingEl.style.display = "none";

snap.forEach(docSnap => {

const d = docSnap.data();

const card = document.createElement("div");
card.className = "airdrop-card";

card.innerHTML = `
<h2>${d.name || "Airdrop"}</h2>

<p>Rate: ${d.rate}</p>
<p>Amount: ${d.amount}</p>
<p>Start: ${new Date(d.startTime).toLocaleString()}</p>
<p>End: ${new Date(d.endTime).toLocaleString()}</p>

<button class="start">START MINING</button>
<button class="stop">STOP MINING</button>
<button class="withdraw">WITHDRAW</button>
`;

listEl.appendChild(card);

// START
card.querySelector(".start").onclick = () => {
startMining(docSnap.id, d.rate, d.endTime);
};

// STOP
card.querySelector(".stop").onclick = () => {
stopMining();
};

// WITHDRAW
card.querySelector(".withdraw").onclick = () => {
window.location.href = "withdrawalairdrop.html";
};

});

});

// START MINING (FIXED)
async function startMining(id, rate, endTime) {

const stateRef = doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

// reset previous
await setDoc(stateRef, {
active: true,
campaignId: id,
rate: parseFloat(rate),
endTime: endTime,
startedAt: Date.now()
});

runMining();

}

// STOP MINING
async function stopMining() {

const stateRef = doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

await updateDoc(stateRef, {
active: false
});

if (miningInterval) {
clearInterval(miningInterval);
miningInterval = null;
}

alert("Mining stopped");

}

// CORE MINING ENGINE (FIXED 100%)
async function runMining() {

const stateRef = doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

// STOP OLD LOOP FIRST
if (miningInterval) {
clearInterval(miningInterval);
miningInterval = null;
}

miningInterval = setInterval(async () => {

const stateSnap = await getDoc(stateRef);

if (!stateSnap.exists()) return;

const state = stateSnap.data();

if (!state.active) {
clearInterval(miningInterval);
miningInterval = null;
return;
}

if (Date.now() > state.endTime) {
await updateDoc(stateRef, { active: false });
clearInterval(miningInterval);
miningInterval = null;
return;
}

const userRef = doc(db, "users", currentUser.uid);
const userSnap = await getDoc(userRef);

if (!userSnap.exists()) return;

const data = userSnap.data();

// SAFE NUMBER FIX
let balance = parseFloat(data.airdropBalance || 0);
let rate = parseFloat(state.rate || 0);

if (isNaN(balance)) balance = 0;
if (isNaN(rate)) rate = 0;

// ADD MINING VALUE
balance = balance + rate;

// SAVE TO FIRESTORE
await updateDoc(userRef, {
airdropBalance: balance
});

// UPDATE UI
balanceEl.innerText = balance.toFixed(8);

}, 1000);

}

// AUTO RESUME MINING AFTER LOGIN
async function checkAutoMining() {

const stateRef = doc(
db,
"users",
currentUser.uid,
"airdropState",
"main"
);

const snap = await getDoc(stateRef);

if (snap.exists() && snap.data().active) {
runMining();
}

}