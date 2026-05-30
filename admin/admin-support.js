import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc
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

const supportList = document.getElementById("supportList");

onAuthStateChanged(auth, async (user) => {

if (!user || localStorage.getItem("adminLoggedIn") !== "true") {
window.location = "admin-login.html";
return;
}

const snap = await getDocs(collection(db, "support"));

snap.forEach((docSnap) => {

const d = docSnap.data();

supportList.innerHTML += `
<div class="bg-zinc-900 p-4 mb-3 rounded-xl">

<p>User: ${d.uid}</p>
<p>Message: ${d.message}</p>
<p>Status: ${d.status}</p>

<button onclick="resolve('${docSnap.id}')"
class="bg-green-500 text-black px-3 py-2">

Mark Resolved

</button>

</div>
`;

});

});

/* RESOLVE MESSAGE */
window.resolve = async (id) => {

await updateDoc(doc(db, "support", id), {
status: "resolved"
});

alert("Marked as resolved");
location.reload();

};