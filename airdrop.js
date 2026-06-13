import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
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
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let uid;
let miningIntervals = {};

// FIX FLOAT DISPLAY
function format(n){
  return Number(n || 0).toFixed(8);
}

// LOGIN CHECK + LIVE BALANCE
onAuthStateChanged(auth, (user)=>{
  if(!user){
    location.href="login.html";
    return;
  }

  uid = user.uid;

  const userRef = doc(db,"users",uid);

  onSnapshot(userRef,(snap)=>{
    const data = snap.data();
    document.getElementById("balance").innerText =
      format(data?.airdropBalance);
  });
});


// LOAD AIRDROPS FROM ADMIN
window.loadAirdrops = async function(){

  const list = document.getElementById("list");
  list.innerHTML = "Loading airdrops...";

  const snap = await getDocs(collection(db,"airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach(d=>{
    const data = d.data();

    list.innerHTML += `
      <div class="card">
        <div class="title">🚀 ${data.name}</div>

        <p>💰 Price: ${data.price}</p>
        <p>⚡ Rate: ${data.rate}</p>
        <p>📅 Start: ${data.startTime}</p>
        <p>📅 End: ${data.endTime}</p>

        <button class="start" onclick="startMining('${d.id}')">
          ⛏️ Start Mining
        </button>
      </div>
    `;
  });
};


// START MINING (0.00000001 per second)
window.startMining = async function(airdropId){

  if(miningIntervals[airdropId]){
    clearInterval(miningIntervals[airdropId]);
  }

  miningIntervals[airdropId] = setInterval(async ()=>{

    const userRef = doc(db,"users",uid);
    const snap = await getDoc(userRef);

    let bal = snap.data()?.airdropBalance || 0;

    // EXACT RULE YOU WANTED
    bal = Number(bal) + 0.00000001;

    await updateDoc(userRef,{
      airdropBalance: bal
    });

  },1000);
};