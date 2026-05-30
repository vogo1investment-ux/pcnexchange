import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc
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

onAuthStateChanged(auth, (user) => {

if (!user || localStorage.getItem("adminLoggedIn") !== "true") {
window.location = "admin-login.html";
return;
}

document.getElementById("sendBtn").onclick = async () => {

const uid = document.getElementById("uid").value;
const message = document.getElementById("message").value;

if (!uid || !message) {
alert("Fill all fields");
return;
}

await addDoc(collection(db, "notifications"), {
uid: uid,
message: message,
createdAt: Date.now()
});

alert("Notification Sent");

};

});