import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
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
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth,(user)=>{

if(!user){
window.location="index.html";
return;
}

const coinsRef = collection(db,"users",user.uid,"coins");

onSnapshot(coinsRef,(snapshot)=>{

let html="";

if(snapshot.empty){
html="<p>No crypto assets found.</p>";
}

snapshot.forEach((doc)=>{

const coin=doc.data();

html+=`
<div class="coin">
<h3>${coin.name || doc.id}</h3>
<p>Balance: ${coin.balance || 0}</p>
</div>
`;

});

document.getElementById("assetsList").innerHTML=html;

});

});