import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

document.getElementById("uploadBtn")
.addEventListener("click", async () => {

const file =
document.getElementById("jsonFile").files[0];

if(!file){
alert("Select coins_with_icons.json");
return;
}

const text = await file.text();

const coins = JSON.parse(text);

const total = coins.length;

let uploaded = 0;

for(const coin of coins){

await setDoc(

doc(db,"coins",coin.symbol),

{
...coin
},

{ merge:true }

);

uploaded++;

const percent =
Math.round((uploaded / total) * 100);

document.getElementById("progressBar")
.style.width = percent + "%";

document.getElementById("progressText")
.innerText = percent + "%";

}

document.getElementById("status")
.innerText =
"Upload Complete. " + uploaded + " Coins Updated";

});