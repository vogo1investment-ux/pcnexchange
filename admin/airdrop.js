import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
doc,
updateDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
apiKey: "AIzaSyCQVHBn504Y26YTR38JRJhRlUbBoa2CIPo",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange",
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= CREATE AIRDROP ================= */

const name = document.getElementById("name");
const desc = document.getElementById("desc");
const rate = document.getElementById("rate");
const amount = document.getElementById("amount");
const start = document.getElementById("start");
const end = document.getElementById("end");

const createBtn = document.getElementById("create");

createBtn.onclick = async () => {

if (!name.value || !rate.value) {
alert("Fill all fields");
return;
}

try {

await addDoc(collection(db, "airdropCampaigns"), {
name: name.value,
description: desc.value,
rate: Number(rate.value),
amount: Number(amount.value),
startTime: new Date(start.value).getTime(),
endTime: new Date(end.value).getTime(),
active: false,
createdAt: Date.now()
});

alert("Airdrop created successfully!");

name.value = "";
desc.value = "";
rate.value = "";
amount.value = "";

} catch (e) {
console.log(e);
alert("Error creating airdrop");
}

};

/* ================= LOAD AIRDROPS ================= */

const loadBtn = document.getElementById("load");
const list = document.getElementById("list");

loadBtn.onclick = async () => {

list.innerHTML = "Loading...";

const snap = await getDocs(collection(db, "airdropCampaigns"));

list.innerHTML = "";

snap.forEach(docSnap => {

const d = docSnap.data();

const div = document.createElement("div");
div.className = "airdrop";

const startTime = d.startTime ? new Date(d.startTime).toLocaleString() : "N/A";
const endTime = d.endTime ? new Date(d.endTime).toLocaleString() : "N/A";

div.innerHTML = `
<h3>${d.name}</h3>
<p>${d.description}</p>
<p>Rate: ${d.rate}</p>
<p>Amount: ${d.amount}</p>
<p>Start: ${startTime}</p>
<p>End: ${endTime}</p>
<p>Status: ${d.active ? "🟢 ACTIVE" : "🔴 STOPPED"}</p>

<button class="start">START AIRDROP</button>
<button class="stop">STOP AIRDROP</button>
`;

list.appendChild(div);

/* ================= START AIRDROP ================= */

div.querySelector(".start").onclick = async () => {

try {

await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: true
});

alert("Airdrop started");

} catch (e) {
console.log(e);
}

};

/* ================= STOP AIRDROP ================= */

div.querySelector(".stop").onclick = async () => {

try {

await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: false
});

alert("Airdrop stopped");

} catch (e) {
console.log(e);
}

};

});

};

/* ================= LIVE USERS MINING ================= */

const usersBox = document.getElementById("users");

onSnapshot(collection(db, "users"), snap => {

if (!usersBox) return;

usersBox.innerHTML = "";

snap.forEach(u => {

const d = u.data();

const div = document.createElement("div");
div.className = "user";

div.innerHTML = `
<b>UID:</b> ${u.id}<br>
Balance: ${d.balance || 0}<br>
Mining: ${d.airdropBalance || 0}
`;

usersBox.appendChild(div);

});

});

/* ================= LIVE WITHDRAWALS ================= */

const withdrawBox = document.getElementById("withdrawals");

onSnapshot(collection(db, "withdrawals"), snap => {

if (!withdrawBox) return;

withdrawBox.innerHTML = "";

snap.forEach(w => {

const d = w.data();

const div = document.createElement("div");
div.className = "user";

div.innerHTML = `
User: ${d.userId}<br>
Amount: ${d.amount}<br>
Status: ${d.status}
`;

withdrawBox.appendChild(div);

});

});