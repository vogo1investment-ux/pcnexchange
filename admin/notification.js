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

const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {

const uid = document.getElementById("userId").value.trim();
const title = document.getElementById("title").value.trim();
const message = document.getElementById("message").value.trim();
const status = document.getElementById("status");

if (!title || !message) {
status.innerText = "Fill title and message";
status.style.color = "red";
return;
}

status.innerText = "Sending...";
status.style.color = "white";

try {

await addDoc(collection(db, "notifications"), {
title: title,
message: message,
target: uid ? "user" : "all",
userId: uid || null,
createdAt: serverTimestamp()
});

status.innerText = "Notification Sent Successfully";
status.style.color = "#00ff88";

document.getElementById("userId").value = "";
document.getElementById("title").value = "";
document.getElementById("message").value = "";

} catch (error) {

console.error(error);

status.innerText = error.message;
status.style.color = "red";

}

});