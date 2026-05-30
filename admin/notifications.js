import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
query,
where,
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

const notifList = document.getElementById("notifList");

onAuthStateChanged(auth, (user) => {

if (!user) {
window.location = "index.html";
return;
}

const q = query(
collection(db, "notifications"),
where("uid", "==", user.uid)
);

onSnapshot(q, (snap) => {

notifList.innerHTML = "";

snap.forEach((doc) => {

const d = doc.data();

notifList.innerHTML += `
<div class="bg-zinc-900 p-4 mb-3 rounded-xl">

<p>${d.message}</p>

</div>
`;

});

});

});