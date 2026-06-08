import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
serverTimestamp
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

document.getElementById("sendNotifBtn")
.addEventListener("click", async () => {

const title =
document.getElementById("notifTitle").value.trim();

const message =
document.getElementById("notifMessage").value.trim();

const status =
document.getElementById("notifStatus");

if(!title || !message){

status.innerHTML =
"<span style='color:red'>Fill all fields</span>";

return;
}

try {

await addDoc(
collection(db,"notifications"),
{
title,
message,
type:"broadcast",
createdAt:serverTimestamp()
}
);

status.innerHTML =
"<span style='color:#00ff88'>Notification Sent Successfully</span>";

document.getElementById("notifTitle").value = "";
document.getElementById("notifMessage").value = "";

}
catch(err){

status.innerHTML =
"<span style='color:red'>" + err.message + "</span>";

}

});