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

const firebaseConfig = {
apiKey: "AIzaSyCQVHBn504Y26YTR38JRJhRlUbBoa2CIPo",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
CREATE AIRDROP
========================= */

document.getElementById("create").onclick = async () => {

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

alert("Airdrop created!");
};

/* =========================
LOAD AIRDROPS
========================= */

document.getElementById("load").onclick = async () => {

const list = document.getElementById("list");
list.innerHTML = "";

const snap = await getDocs(collection(db, "airdropCampaigns"));

snap.forEach(docSnap => {

const d = docSnap.data();

const div = document.createElement("div");
div.className = "airdrop";

const start = d.startTime ? new Date(Number(d.startTime)) : null;
const end = d.endTime ? new Date(Number(d.endTime)) : null;

div.innerHTML = `
<h3>${d.name}</h3>
<p>${d.description}</p>
<p>Rate: ${d.rate}</p>
<p>Start: ${start ? start.toLocaleString() : "N/A"}</p>
<p>End: ${end ? end.toLocaleString() : "N/A"}</p>

<button class="start">START</button>
<button class="stop">STOP</button>
`;

list.appendChild(div);

/* START AIRDROP */
div.querySelector(".start").onclick = async () => {
await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: true
});
alert("Started");
};

/* STOP AIRDROP */
div.querySelector(".stop").onclick = async () => {
await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: false
});
alert("Stopped");
};

});

};

/* =========================
LIVE USERS MINING
========================= */

onSnapshot(collection(db, "users"), (snap) => {

const box = document.getElementById("users");
box.innerHTML = "";

snap.forEach(u => {

const d = u.data();

if (d.airdropBalance > 0) {

const div = document.createElement("div");
div.className = "user";

div.innerHTML = `
UID: ${u.id} <br>
Balance: ${d.airdropBalance}
`;

box.appendChild(div);

}

});

});

/* =========================
WITHDRAWALS
========================= */

onSnapshot(collection(db, "withdrawals"), (snap) => {

const box = document.getElementById("withdrawals");
box.innerHTML = "";

snap.forEach(w => {

const d = w.data();

const div = document.createElement("div");
div.className = "user";

div.innerHTML = `
User: ${d.userId} <br>
Amount: ${d.amount} <br>
Status: ${d.status}
`;

box.appendChild(div);

});

});