import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let user;
let timers = {};
let balances = {};

const list = document.getElementById("list");
const activeCount = document.getElementById("activeCount");

onAuthStateChanged(auth, async (u) => {
  if (!u) return;
  user = u;

  await loadSavedStates();
  loadAirdrops();
});

document.getElementById("searchBtn").onclick = loadAirdrops;

async function loadSavedStates(){
  const snap = await getDocs(collection(db, "users", user.uid, "airdropState"));

  snap.forEach(d => {
    const data = d.data();
    if(data.active){
      startMining(d.id, data.rate);
    }
  });
}

async function loadAirdrops(){

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(d => {
    render(d.id, d.data());
  });
}

function render(id, data){

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="title">${data.name}</div>

    <div class="desc">
      ${data.description || "This airdrop campaign is active and rewards users based on mining activity."}
    </div>

    <div class="grid">

      <div class="box">💰 Rate: ${data.rate}</div>
      <div class="box">📦 Total Pool: ${data.amount}</div>

      <div class="box">📅 Start: ${data.startDate} ${data.startTime}</div>
      <div class="box">⛔ End: ${data.endDate} ${data.endTime}</div>

    </div>

    <div class="balance">
      Mining Balance: <span id="bal-${id}">0.00000000</span>
    </div>

    <div class="actions">
      <button class="start">Start Mining</button>
      <button class="stop">Stop Mining</button>
      <button class="withdraw">Withdraw</button>
    </div>

    <div class="note">
      ⚠️ Withdrawal Notice: Once submitted, your request will be reviewed and credited to your withdrawable balance after administrative approval. This process is irreversible after confirmation.
    </div>
  `;

  card.querySelector(".start").onclick = () => startMining(id, parseFloat(data.rate));
  card.querySelector(".stop").onclick = () => stopMining(id);
  card.querySelector(".withdraw").onclick = () => withdraw(id);

  list.appendChild(card);
}

function startMining(id, rate){

  if(timers[id]) return;

  balances[id] = balances[id] || 0;

  timers[id] = setInterval(async () => {

    balances[id] += rate;

    document.getElementById("bal-" + id).innerText =
      balances[id].toFixed(8);

    await setDoc(doc(db, "users", user.uid, "airdropState", id), {
      active:true,
      balance:balances[id],
      rate:rate,
      updatedAt:Date.now()
    }, {merge:true});

    updateActiveCount();

  }, 2000);
}

function stopMining(id){
  clearInterval(timers[id]);
  delete timers[id];

  setDoc(doc(db, "users", user.uid, "airdropState", id), {
    active:false
  }, {merge:true});

  updateActiveCount();
}

function updateActiveCount(){
  activeCount.innerText = Object.keys(timers).length;
}

async function withdraw(id){

  const amount = balances[id] || 0;

  await setDoc(doc(collection(db, "airdropWithdrawals")), {
    userId:user.uid,
    airdropId:id,
    amount:amount,
    status:"pending",
    message:"Your withdrawal request is under administrative review and will be processed shortly.",
    createdAt:Date.now()
  });

  alert("Withdrawal request successfully submitted for processing.");
}