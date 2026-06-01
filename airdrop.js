import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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

const airdropsContainer = document.getElementById("airdropsContainer");
let currentUser = null;

onAuthStateChanged(auth, user => {
  if(!user){
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  loadAirdrops();
});

async function loadAirdrops() {
  const airdropsCol = collection(db, "airdrops");
  const snapshot = await getDocs(airdropsCol);
  airdropsContainer.innerHTML = "";

  snapshot.forEach(docSnap => {
    const airdrop = docSnap.data();
    const now = Date.now();

    // Only show active airdrops
    if(now >= airdrop.startDate && now <= airdrop.endDate){
      const card = document.createElement("div");
      card.className = "airdrop-card";
      card.innerHTML = `
        <div class="airdrop-name">${airdrop.coinName} (${airdrop.symbol})</div>
        <div class="airdrop-info">
          Starts: ${new Date(airdrop.startDate).toLocaleDateString()} <br>
          Ends: ${new Date(airdrop.endDate).toLocaleDateString()} <br>
          Price per coin: ${airdrop.pricePerCoin || 0}
        </div>
        <div>Your Airdrop Balance: <span id="airdropBalance-${docSnap.id}">0</span></div>
        <button class="button" id="collectBtn-${docSnap.id}">Collect Airdrop</button>
        <button class="button" id="withdrawBtn-${docSnap.id}">Withdraw</button>
      `;
      airdropsContainer.appendChild(card);

      // Start collecting airdrop
      const collectBtn = document.getElementById(`collectBtn-${docSnap.id}`);
      const balanceEl = document.getElementById(`airdropBalance-${docSnap.id}`);
      collectBtn.addEventListener("click", async ()=>{
        const userAirdropRef = doc(db, "users", currentUser.uid, "airdrops", docSnap.id);
        const userSnapshot = await getDoc(userAirdropRef);
        if(!userSnapshot.exists()){
          await setDoc(userAirdropRef, { balance: 0.0001, status: "collecting" });
        }
        // Increment balance over time until endDate
        const interval = setInterval(async ()=>{
          const nowTime = Date.now();
          if(nowTime > airdrop.endDate){
            clearInterval(interval);
            await setDoc(userAirdropRef, { status:"completed" }, { merge:true });
            return;
          }
          const snap = await getDoc(userAirdropRef);
          const data = snap.data();
          const newBalance = (data.balance || 0) + 0.0001;
          await setDoc(userAirdropRef, { balance:newBalance }, { merge:true });
          balanceEl.innerText = newBalance.toFixed(6);
        }, 1000); // every second, adjust as needed
      });

      // Withdraw airdrop
      const withdrawBtn = document.getElementById(`withdrawBtn-${docSnap.id}`);
      withdrawBtn.addEventListener("click", async ()=>{
        const userAirdropRef = doc(db, "users", currentUser.uid, "airdrops", docSnap.id);
        const snap = await getDoc(userAirdropRef);
        if(!snap.exists()) return alert("No airdrop balance yet.");
        const balance = snap.data().balance || 0;
        if(balance <= 0) return alert("No airdrop balance to withdraw.");
        // Create pending withdrawal
        const txRef = doc(collection(db, "users", currentUser.uid, "transactions"));
        await setDoc(txRef, {
          coin: airdrop.symbol,
          type: "airdrop-withdraw",
          amount: balance,
          status: "pending",
          timestamp: Date.now()
        });
        // Reset user airdrop balance
        await setDoc(userAirdropRef, { balance:0 }, { merge:true });
        alert("Withdrawal request sent. Waiting for admin approval.");
      });

      // Show current airdrop balance in real-time
      const userAirdropRef = doc(db, "users", currentUser.uid, "airdrops", docSnap.id);
      onSnapshot(userAirdropRef, snap=>{
        if(snap.exists()){
          balanceEl.innerText = (snap.data().balance || 0).toFixed(6);
        }
      });
    }
  });
}