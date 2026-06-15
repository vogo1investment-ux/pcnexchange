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

let user = null;
let interval = null;

// UI
const balanceEl = document.getElementById("airdropBalance");
const searchBtn = document.getElementById("searchAirdropsBtn");
const listEl = document.getElementById("airdropList");
const loading = document.getElementById("loadingBox");

// LOGIN
onAuthStateChanged(auth, async (u) => {
if (!u) return;

user = u;

await initBalance();
await resumeMining();
});

// INIT BALANCE (ALWAYS SAFE)
async function initBalance() {

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

if (!snap.exists()) {
await setDoc(ref, {
airdropBalance: 0
});
}

balanceEl.innerText = "0.00000000";
}

// SEARCH AIRDROPS
searchBtn.onclick = async () => {

loading.style.display = "block";
listEl.innerHTML = "";

const snap = await getDocs(collection(db, "airdropCampaigns"));

loading.style.display = "none";

snap.forEach(docSnap => {

const d = docSnap.data();

// FIX INVALID DATE ISSUE
const start = d.startTime ? new Date(Number(d.startTime)) : null;
const end = d.endTime ? new Date(Number(d.endTime)) : null;

const card = document.createElement("div");
card.className = "airdrop-card";

card.innerHTML = `
<h3>${d.name || "Airdrop"}</h3>

<p>Rate: ${d.rate || 0}</p>

<p>Start: ${start ? start.toLocaleString() : "Not set"}</p>
<p>End: ${end ? end.toLocaleString() : "Not set"}</p>

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

};

// START MINING
async function startMining(id, rate, endTime) {

const stateRef = doc(db, "users", user.uid, "airdropState", "main");

await setDoc(stateRef, {
active: true,
campaignId: id,
rate: Number(rate || 0),
endTime: Number(endTime || Date.now() + 100000),
startedAt: Date.now()
});

runMining();

}

// STOP MINING
async function stopMining() {

const stateRef = doc(db, "users", user.uid, "airdropState", "main");

await updateDoc(stateRef, {
active: false
});

if (interval) {
clearInterval(interval);
interval = null;
}

alert("Mining stopped");
}

// MINING ENGINE (FIXED CORE)
async function runMining() {

const stateRef = doc(db, "users", user.uid, "airdropState", "main");

if (interval) clearInterval(interval);

interval = setInterval(async () => {

const snap = await getDoc(stateRef);
if (!snap.exists()) return;

const st = snap.data();

if (!st.active) {
clearInterval(interval);
interval = null;
return;
}

if (Date.now() > Number(st.endTime)) {
await updateDoc(stateRef, { active: false });
clearInterval(interval);
interval = null;
return;
}

const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);

let bal = Number(userSnap.data().airdropBalance || 0);
let rate = Number(st.rate || 0);

if (isNaN(bal)) bal = 0;
if (isNaN(rate)) rate = 0;

// ADD BALANCE
bal += rate;

await updateDoc(userRef, {
airdropBalance: bal
});

balanceEl.innerText = bal.toFixed(8);

}, 1000);

}

// AUTO RESUME MINING
async function resumeMining() {

const stateRef = doc(db, "users", user.uid, "airdropState", "main");

const snap = await getDoc(stateRef);

if (snap.exists() && snap.data().active) {
runMining();
}

}