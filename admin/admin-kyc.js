import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const app = initializeApp({
apiKey:"AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
authDomain:"pcnexchange.firebaseapp.com",
projectId:"pcnexchange"
});

const db = getFirestore(app);
const auth = getAuth(app);

const kycList = document.getElementById("kycList");

onAuthStateChanged(auth, async(user)=>{

if(!user){
window.location="admin-login.html";
return;
}

const snap = await getDocs(collection(db,"kyc"));

snap.forEach((d)=>{

const data = d.data();

kycList.innerHTML += `
<div class="bg-zinc-900 p-4 mb-2">
<p>${data.name}</p>
<p>${data.status}</p>

<button onclick="approve('${d.id}','${data.uid}')">
Approve
</button>

</div>
`;

});

});

window.approve = async(id,uid)=>{

await updateDoc(doc(db,"kyc",id),{
status:"approved"
});

await updateDoc(doc(db,"users",uid),{
kyc:"verified"
});

alert("Approved");

};