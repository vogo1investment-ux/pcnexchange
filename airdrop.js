import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


// ✅ YOUR FIREBASE CONFIG (NOW CORRECTLY USED)
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let user = null;
let intervals = {};

const list = document.getElementById("list");
const activeCount = document.getElementById("activeCount");

onAuthStateChanged(auth, async (u) => {
  if (!u) return;

  user = u;

  await loadAirdrops();
  await restoreMining();
});

document.getElementById("searchBtn").onclick = loadAirdrops;

async function loadAirdrops() {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(docSnap => {
    render(docSnap.id, docSnap.data());
  });
}

// 🔥 FIXED RENDER
function render(id, data){

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <h3>${data.name}</h3>
    <div class="small">${data.description}</div>

    <div class="row">
      <div>Rate: ${data.rate}</div>
      <div>Amount: ${data.amount}</div>
    </div>

    <div class="btns">
      <button class="start">Start</button>
      <button class="stop">Stop</button>
      <button class="withdraw">Withdraw</button>
    </div>

    <div class="small">Balance: <span id="bal-${id}">0.00000000</span></div>

    <input id="w-${id}" placeholder="Withdraw amount">

    <div class="small">
      If you place withdrawal it will go to your withdrawal balance after admin approves
    </div>
  `;

  div.querySelector(".start").onclick = () => startMining(id, parseFloat(data.rate));
  div.querySelector(".stop").onclick = () => stopMining(id);
  div.querySelector(".withdraw").onclick = () => withdraw(id);

  list.appendChild(div);
}

// 🔥 FIXED MINING (WORKS AFTER LOGIN)
function startMining(id, rate){

  if(intervals[id]) return;

  let balance = 0;

  intervals[id] = setInterval(async () => {

    balance += rate;

    document.getElementById("bal-" + id).innerText = balance.toFixed(8);

    await setDoc(doc(db, "users", user.uid, "airdropState", id), {
      active: true,
      balance,
      rate
    }, { merge:true });

    updateCount();

  }, 2000);
}

// 🔥 STOP MINING
function stopMining(id){

  clearInterval(intervals[id]);
  delete intervals[id];

  setDoc(doc(db, "users", user.uid, "airdropState", id), {
    active:false
  }, { merge:true });

  updateCount();
}

// 🔥 FIXED WITHDRAW (WRITES CORRECT COLLECTION)
async function withdraw(id){

  const amount = document.getElementById("w-" + id).value;

  await setDoc(doc(collection(db, "airdropWithdrawals")), {
    userId: user.uid,
    airdropId: id,
    amount: Number(amount),
    status: "pending",
    createdAt: Date.now()
  });

  alert("Withdrawal sent!");
}

// 🔥 RESTORE MINING AFTER LOGIN
async function restoreMining(){

  const snap = await getDocs(collection(db, "users", user.uid, "airdropState"));

  snap.forEach(docSnap => {

    const data = docSnap.data();

    if(data.active){
      startMining(docSnap.id, data.rate || 0);
    }
  });

  updateCount();
}

function updateCount(){
  activeCount.innerText = Object.keys(intervals).length;
}