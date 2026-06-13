import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
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
let miningIntervals = {};
let balance = 0;

const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");
const searchBtn = document.getElementById("searchBtn");

/* FIX BALANCE FORMAT */
function formatBalance(val){
  return Number(val).toFixed(8);
}

/* LOAD USER STATE */
async function loadUserState(){
  const ref = doc(db, "users", uid, "airdropState", "main");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    balance = snap.data().balance || 0;
    balanceEl.innerText = formatBalance(balance);
  } else {
    await setDoc(ref, { balance: 0 });
    balance = 0;
  }
}

/* SAVE BALANCE */
async function saveBalance(){
  const ref = doc(db, "users", uid, "airdropState", "main");
  await updateDoc(ref, { balance });
}

/* MINING ENGINE */
function startMining(airdropId, rate){
  if (miningIntervals[airdropId]) return;

  miningIntervals[airdropId] = setInterval(async () => {
    balance += 0.00000001 * (rate || 1);

    balanceEl.innerText = formatBalance(balance);
    await saveBalance();
  }, 1000);
}

/* LOAD AIRDROPS */
async function loadAirdrops(){
  list.innerHTML = "Loading airdrops...";

  try{
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    list.innerHTML = "";

    snap.forEach(docSnap => {
      const d = docSnap.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>🚀 ${d.name}</h3>
        <div class="small">Start: ${d.startTime || "-"}</div>
        <div class="small">End: ${d.endTime || "-"}</div>
        <div class="small">Rate: ${d.rate || 1}</div>

        <button class="btn start">▶ Start Mining</button>
      `;

      const btn = card.querySelector("button");

      btn.onclick = () => {
        startMining(docSnap.id, d.rate);
        btn.innerText = "Mining...";
        btn.disabled = true;
      };

      list.appendChild(card);
    });

    if (snap.empty){
      list.innerHTML = "No airdrops available";
    }

  } catch (e){
    console.log(e);
    list.innerHTML = "❌ Failed to load airdrops";
  }
}

/* AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user){
    alert("Login required");
    location.href = "login.html";
    return;
  }

  uid = user.uid;
  await loadUserState();
});

/* BUTTON */
searchBtn.addEventListener("click", loadAirdrops);