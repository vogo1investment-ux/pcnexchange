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

let userId = null;

onAuthStateChanged(auth, (user) => {

if (!user) {
window.location = "index.html";
return;
}

userId = user.uid;

});

document.getElementById("sendBtn").onclick = async () => {

const msg = document.getElementById("message").value;

if (!msg) return alert("Enter message");

await addDoc(collection(db, "support"), {
uid: userId,
message: msg,
status: "open",
createdAt: Date.now()
});

alert("Message sent");
};