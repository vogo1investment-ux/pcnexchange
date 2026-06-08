import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const targetType = document.getElementById("targetType");
const uidInput = document.getElementById("uidInput");

targetType.addEventListener("change", () => {
uidInput.style.display = targetType.value === "uid" ? "block" : "none";
});

document.getElementById("sendBtn").addEventListener("click", async () => {

const title = document.getElementById("title").value.trim();
const message = document.getElementById("message").value.trim();
const status = document.getElementById("status");
const type = targetType.value;
const uid = uidInput.value.trim();

if (!title || !message) {
status.innerText = "Fill all fields";
status.style.color = "red";
return;
}

if (type === "uid" && !uid) {
status.innerText = "Enter UID";
status.style.color = "red";
return;
}

try {
await addDoc(collection(db, "notifications"), {
title,
message,
type,
uid: type === "uid" ? uid : null,
createdAt: serverTimestamp()
});

status.innerText = "Notification Sent";
status.style.color = "lightgreen";

document.getElementById("title").value = "";
document.getElementById("message").value = "";
uidInput.value = "";

} catch (err) {
status.innerText = err.message;
status.style.color = "red";
}

});