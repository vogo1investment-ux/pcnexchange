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

/* ================= WAIT FOR DOM ================= */

window.addEventListener("DOMContentLoaded", () => {

console.log("Airdrop JS loaded ✅");

/* ================= BUTTON CHECK ================= */

const createBtn = document.getElementById("create");

if (!createBtn) {
console.error("CREATE BUTTON NOT FOUND ❌");
return;
}

/* ================= CREATE AIRDROP ================= */

createBtn.onclick = async () => {

const name = document.getElementById("name");
const desc = document.getElementById("desc");
const rate = document.getElementById("rate");
const amount = document.getElementById("amount");
const start = document.getElementById("start");
const end = document.getElementById("end");

if (!name || !rate) {
alert("Missing fields");
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

alert("Airdrop Created ✔");

} catch (e) {
console.error(e);
alert("Error creating airdrop");
}

};

/* ================= LOAD AIRDROPS ================= */

const loadBtn = document.getElementById("load");
const list = document.getElementById("list");

if (loadBtn) {

loadBtn.onclick = async () => {

list.innerHTML = "Loading...";

const snap = await getDocs(collection(db, "airdropCampaigns"));

list.innerHTML = "";

snap.forEach(docSnap => {

const d = docSnap.data();

const div = document.createElement("div");

div.innerHTML = `
<h3>${d.name}</h3>
<p>${d.description}</p>
<p>Rate: ${d.rate}</p>
<p>Status: ${d.active ? "ACTIVE" : "STOPPED"}</p>

<button class="start">START</button>
<button class="stop">STOP</button>
`;

list.appendChild(div);

/* START */
div.querySelector(".start").onclick = async () => {
await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: true
});
alert("Started");
};

/* STOP */
div.querySelector(".stop").onclick = async () => {
await updateDoc(doc(db, "airdropCampaigns", docSnap.id), {
active: false
});
alert("Stopped");
};

});

};

}

});