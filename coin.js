import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import QRious from "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";

// Firebase Config
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
setPersistence(auth, browserLocalPersistence);

let currentUser = null;
let coinSymbol = new URLSearchParams(window.location.search).get("symbol");
let coinData = null;

const coinNameEl = document.getElementById("coinName");
const coinSymbolEl = document.getElementById("coinSymbol");
const coinPriceEl = document.getElementById("coinPrice");

const transferBtn = document.getElementById("transferBtn");
const receiveBtn = document.getElementById("receiveBtn");
const swapBtn = document.getElementById("swapBtn");

const transferForm = document.getElementById("transferForm");
const receiveForm = document.getElementById("receiveForm");
const swapForm = document.getElementById("swapForm");

const recipientInput = document.getElementById("recipient");
const amountInput = document.getElementById("amount");
const passwordInput = document.getElementById("password");
const submitTransfer = document.getElementById("submitTransfer");

const userEmail = document.getElementById("userEmail");
const userUid = document.getElementById("userUid");
const copyBtn = document.getElementById("copyBtn");
const qrCanvas = document.getElementById("qrcode");

const swapAmountInput = document.getElementById("swapAmount");
const submitSwap = document.getElementById("submitSwap");

// Auth
onAuthStateChanged(auth, user => {
  if(!user) window.location.href="index.html";
  currentUser = user;
  userEmail.value = user.email;
  userUid.value = user.uid;

  // QR code
  new QRious({ element: qrCanvas, value: JSON.stringify({email:user.email, uid:user.uid}), size:200, background:"#000", foreground:"#0f0" });
});

// Coin Buttons
transferBtn.addEventListener("click",()=>{ transferForm.classList.remove("hidden"); receiveForm.classList.add("hidden"); swapForm.classList.add("hidden"); });
receiveBtn.addEventListener("click",()=>{ receiveForm.classList.remove("hidden"); transferForm.classList.add("hidden"); swapForm.classList.add("hidden"); });
swapBtn.addEventListener("click",()=>{ swapForm.classList.remove("hidden"); transferForm.classList.add("hidden"); receiveForm.classList.add("hidden"); });

// Copy receive info
copyBtn.addEventListener("click", ()=>{
  navigator.clipboard.writeText(`Email:${userEmail.value}\nUID:${userUid.value}`).then(()=>alert("Copied!"));
});

// Load coin data
async function loadCoin(){
  const docRef = doc(db,"coins",coinSymbol);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()) coinData = docSnap.data();
  coinNameEl.innerText = coinData.name;
  coinSymbolEl.innerText = coinData.symbol;
  coinPriceEl.innerText = "$"+coinData.price.toLocaleString();
}
loadCoin();

// Transfer Coin
submitTransfer.addEventListener("click",async ()=>{
  const recipient = recipientInput.value.trim();
  const amount = Number(amountInput.value);
  const password = passwordInput.value;
  if(!recipient||!amount||!password) return alert("Fill all fields");

  try{
    await signInWithEmailAndPassword(auth,currentUser.email,password);
    const senderRef = doc(db,"users",currentUser.uid);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data();
    if((senderData[coinSymbol]||0)<amount) return alert("Insufficient coin balance");

    await updateDoc(senderRef,{ [coinSymbol]: senderData[coinSymbol]-amount });

    const transferTx = { type:"transfer", coin:coinSymbol, amount, to:recipient, from:currentUser.uid, timestamp:Date.now(), status:"pending" };
    const senderTransRef = collection(db,"users",currentUser.uid,"transactions");
    await addDoc(senderTransRef,transferTx);
    await updateDoc(senderRef,{ transactions: arrayUnion(transferTx) });

    alert("Transfer submitted! Pending approval.");
    recipientInput.value=""; amountInput.value=""; passwordInput.value="";
  }catch(err){ console.error(err); alert("Failed: "+err.message);}
});

// Swap
submitSwap.addEventListener("click",async ()=>{
  const swapAmount = Number(swapAmountInput.value);
  if(!swapAmount||swapAmount<=0) return alert("Enter a valid amount");
  try{
    const userRef = doc(db,"users",currentUser.uid);
    const userSnap = await getDoc(userRef);
    const bal = userSnap.data().availableBalance||0;
    if(bal<swapAmount) return alert("Insufficient balance");

    await updateDoc(userRef,{
      availableBalance: bal-swapAmount,
      [coinSymbol]: (userSnap.data()[coinSymbol]||0)+swapAmount
    });

    const swapTx = { type:"swap", coin:coinSymbol, amount:swapAmount, timestamp:Date.now(), status:"approved" };
    const userTransRef = collection(db,"users",currentUser.uid,"transactions");
    await addDoc(userTransRef,swapTx);
    await updateDoc(userRef,{ transactions: arrayUnion(swapTx) });

    alert("Swap successful!");
    swapAmountInput.value="";
  }catch(err){ console.error(err); alert("Swap failed: "+err.message);}
});