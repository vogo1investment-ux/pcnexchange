import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let uid;
let balance = 0;
let miningIntervals = {};

const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("list");

/* FORMAT BALANCE */
function format(n){
  return Number(n).toFixed(8);
}

/* LOAD USER */
onAuthStateChanged(auth, async (user)=>{
  if(!user) return;

  uid = user.uid;

  const ref = doc(db,"users",uid);
  const snap = await getDoc(ref);

  if(snap.exists() && snap.data().balance){
    balance = snap.data().balance;
  } else {
    await setDoc(ref,{balance:0},{merge:true});
    balance = 0;
  }

  updateBalance();
});

/* UPDATE BALANCE UI */
function updateBalance(){
  balanceEl.textContent = format(balance);
}

/* LOAD AIRDROPS */
window.loadAirdrops = async function(){

  listEl.innerHTML = "Loading airdrops...";

  const snap = await getDocs(collection(db,"airdropCampaigns"));

  listEl.innerHTML = "";

  snap.forEach(docSnap=>{
    const d = docSnap.data();

    const id = docSnap.id;

    listEl.innerHTML += `
      <div class="card">
        <div class="title">${d.name}</div>

        <div class="row">
          <span>Start: ${new Date(d.startTime).toLocaleString()}</span>
        </div>

        <div class="row">
          <span>End: ${new Date(d.endTime).toLocaleString()}</span>
        </div>

        <div class="row">
          <span>Rate: 0.00000001 / tick</span>
        </div>

        <button class="mineBtn" onclick="startMining('${id}', ${d.endTime})">
          Start Mining
        </button>
      </div>
    `;
  });
};

/* START MINING */
window.startMining = async function(airdropId, endTime){

  if(miningIntervals[airdropId]){
    alert("Already mining this airdrop");
    return;
  }

  const userRef = doc(db,"users",uid);

  miningIntervals[airdropId] = setInterval(async ()=>{

    const now = Date.now();

    if(now > endTime){
      clearInterval(miningIntervals[airdropId]);
      delete miningIntervals[airdropId];
      alert("Airdrop ended");
      return;
    }

    balance += 0.00000001;

    updateBalance();

    await updateDoc(userRef,{
      balance: balance
    });

  }, 2000); // tick speed

};