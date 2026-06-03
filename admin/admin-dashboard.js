import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const sectionContent=document.getElementById("section-content");
const buttons=document.querySelectorAll(".sidebar-btn");

// ---------------- AUTH ----------------
onAuthStateChanged(auth,user=>{
  if(!user || user.uid!==ADMIN_UID) window.location.href="admin-login.html";
});

// ---------------- LOGOUT ----------------
document.getElementById("logoutBtn").onclick=async()=>{
  await signOut(auth); window.location.href="admin-login.html";
};

// ---------------- DASHBOARD ----------------
async function loadDashboard(){
  const usersSnap=await getDocs(collection(db,"users"));
  const txSnap=await getDocs(collection(db,"pendingTransactions"));
  document.getElementById("totalUsers").innerText=usersSnap.size;
  let deposits=0, withdrawals=0;
  txSnap.forEach(doc=>{
    const d=doc.data();
    if(d.type==="deposit") deposits+=Number(d.amount||0);
    if(d.type==="withdrawal") withdrawals+=Number(d.amount||0);
  });
  document.getElementById("totalDeposits").innerText=`$${deposits.toLocaleString()}`;
  document.getElementById("totalWithdrawals").innerText=`$${withdrawals.toLocaleString()}`;
}

// ---------------- USERS / KYC ----------------
async function loadUsers(){
  const snap=await getDocs(collection(db,"users"));
  let html=`<table><tr><th>Username</th><th>Email</th><th>KYC</th><th>Edit</th></tr>`;
  snap.forEach(doc=>{
    const data=doc.data();
    html+=`<tr><td>${data.username}</td><td>${data.email}</td><td>${data.kycStatus||'Pending'}</td>
      <td><button onclick="editUser('${doc.id}')">Edit</button></td></tr>`;
  });
  html+="</table>";
  sectionContent.innerHTML=html;
}
window.editUser=async(uid)=>{
  const ref=doc(db,"users",uid); const snap=await getDoc(ref);
  if(!snap.exists()) return; const data=snap.data();
  const newUsername=prompt("Username",data.username);
  const newKYC=prompt("KYC Status",data.kycStatus||"Pending");
  await updateDoc(ref,{username:newUsername,kycStatus:newKYC});
  loadUsers();
};

// ---------------- NOTIFICATIONS ----------------
async function loadNotifications(){
  sectionContent.innerHTML=`<h3>Send Notification</h3>
    <input id="notifUid" placeholder="User UID (blank for all)">
    <textarea id="notifMsg" placeholder="Message"></textarea>
    <button id="sendNotifBtn">Send</button>`;
  document.getElementById("sendNotifBtn").onclick=async()=>{
    const uid=document.getElementById("notifUid").value.trim();
    const msg=document.getElementById("notifMsg").value.trim();
    if(!msg){alert("Enter message");return;}
    if(uid){await addDoc(collection(db,"notifications"),{userId:uid,message:msg,createdAt:Date.now()});}
    else{await addDoc(collection(db,"notifications"),{userId:null,message:msg,createdAt:Date.now()});}
    alert("Notification sent!"); document.getElementById("notifMsg").value=""; document.getElementById("notifUid").value="";
  };
}

// ---------------- CRYPTO ASSETS ----------------
async function loadCryptoAssets(){
  const usersSnap=await getDocs(collection(db,"users"));
  let html=`<table><tr><th>User</th><th>Coin</th><th>Balance</th><th>Edit</th></tr>`;
  for(const u of usersSnap.docs){
    const coinsCol=collection(db,"users",u.id,"coins");
    const coinsSnap=await getDocs(coinsCol);
    coinsSnap.forEach(c=>{
      const d=c.data();
      html+=`<tr><td>${u.data().username}</td><td>${d.name}</td><td>${d.balance}</td>
        <td><button onclick="editCoin('${u.id}','${c.id}')">Edit</button></td></tr>`;
    });
  }
  html+="</table>"; sectionContent.innerHTML=html;
}
window.editCoin=async(uid,coinId)=>{
  const ref=doc(db,"users",uid,"coins",coinId);
  const snap=await getDoc(ref);
  if(!snap.exists()) return;
  const data=snap.data();
  const newBalance=prompt("Balance",data.balance||"0.00000000");
  await updateDoc(ref,{balance:newBalance});
  loadCryptoAssets();
};

// ---------------- TRADES ----------------
async function loadTrades(){
  const snap=await getDocs(collection(db,"pendingTrades"));
  let html=`<table><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th></tr>`;
  snap.forEach(doc=>{
    const d=doc.data();
    html+=`<tr><td>${d.userId}</td><td>${d.type}</td><td>${d.amount}</td><td>${d.status||"Pending"}</td>
      <td><button onclick="approveTrade('${doc.id}')">Approve</button>
          <button onclick="rejectTrade('${doc.id}')">Reject</button></td></tr>`;
  });
  html+="</table>"; sectionContent.innerHTML=html;
}
window.approveTrade=async(tid)=>{const ref=doc(db,"pendingTrades",tid); await updateDoc(ref,{status:"Approved"}); loadTrades();}
window.rejectTrade=async(tid)=>{const ref=doc(db,"pendingTrades",tid); await updateDoc(ref,{status:"Rejected"}); loadTrades();}

// ---------------- SIDEBAR NAV ----------------
buttons.forEach(btn=>{
  btn.addEventListener("click",async()=>{
    const section=btn.dataset.section;
    sectionContent.innerHTML=`<p>Loading ${section}...</p>`;
    switch(section){
      case "dashboard": loadDashboard(); break;
      case "users": loadUsers(); break;
      case "kyc": loadUsers(); break;
      case "crypto-assets": loadCryptoAssets(); break;
      case "trades": loadTrades(); break;
      case "notifications": loadNotifications(); break;
      default: sectionContent.innerHTML=`<p>${section} not implemented yet</p>`;
    }
  });
});

// ---------------- INITIAL LOAD ----------------
loadDashboard();