import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// YOUR ADMIN UID
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const listDiv = document.getElementById("kycList");

async function loadKYC() {

const user = auth.currentUser;

if (!user) {
listDiv.innerHTML = "Please login as admin";
return;
}

if (user.uid !== ADMIN_UID) {
listDiv.innerHTML = "Not authorized";
return;
}

const snap = await getDocs(collection(db, "kyc"));

listDiv.innerHTML = "";

snap.forEach((d) => {
const data = d.data();

const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<div class="row">

<div class="col">
<img src="${data.imageUrl || ''}" />
</div>

<div class="col">
<div><b>Name:</b> ${data.fullName || "N/A"}</div>
<div><b>ID Number:</b> ${data.idNumber || "N/A"}</div>
<div><b>Email:</b> ${data.email || "N/A"}</div>
<div><b>UID:</b> ${data.uid || "N/A"}</div>
<div class="status">Status: ${data.status || "pending"}</div>
</div>

</div>

<select id="status-${d.id}">
<option value="approved">Approve</option>
<option value="rejected">Reject</option>
</select>

<button onclick="updateStatus('${d.id}')">Submit Decision</button>
`;

listDiv.appendChild(card);
});
}

// UPDATE STATUS
window.updateStatus = async (id) => {
const select = document.getElementById("status-" + id);
const value = select.value;

await updateDoc(doc(db, "kyc", id), {
status: value
});

alert("KYC updated: " + value);
loadKYC();
};

// wait for auth then load
auth.onAuthStateChanged(() => {
loadKYC();
});