import {
initializeApp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getFirestore,
collection,
query,
where,
onSnapshot,
doc,
updateDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* FIREBASE CONFIG */
const firebaseConfig = {

apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_SENDER_ID",
appId: "YOUR_APP_ID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const transferList = document.getElementById("transferList");

/* LOAD PENDING TRANSFERS */
const q = query(
collection(db, "transferRequests"),
where("status", "==", "pending")
);

onSnapshot(q, (snap) => {

transferList.innerHTML = "";

snap.forEach((docSnap) => {

const data = docSnap.data();
const id = docSnap.id;

transferList.innerHTML += `

<div style="background:#111;padding:15px;margin-bottom:10px;border-radius:10px;border:1px solid #222">

<p><b>Sender ID:</b> ${data.senderId}</p>
<p><b>Receiver:</b> ${data.receiver}</p>
<p><b>Amount:</b> $${data.amount}</p>

<div style="margin-top:10px;display:flex;gap:10px">

<button onclick="approveTransfer('${id}', '${data.senderId}', '${data.receiver}', ${data.amount})"
style="background:green;color:white;padding:8px 12px;border-radius:5px">

Approve

</button>

<button onclick="rejectTransfer('${id}')"
style="background:red;color:white;padding:8px 12px;border-radius:5px">

Reject

</button>

</div>

</div>

`;

});

});

/* APPROVE TRANSFER (REAL MONEY ENGINE) */
window.approveTransfer = async (id, senderId, receiver, amount) => {

try {

/* USERS COLLECTION */
const usersRef = collection(db, "users");

/* FIND SENDER */
const senderSnap = await getDocs(usersRef);

/* FIND USERS MANUALLY */
let senderDoc, receiverDoc;

senderSnap.forEach((docItem) => {

const data = docItem.data();

if (data.uid === senderId) {
senderDoc = docItem;
}

if (data.email === receiver || data.uid === receiver) {
receiverDoc = docItem;
}

});

/* VALIDATION */
if (!senderDoc || !receiverDoc) {
alert("User not found");
return;
}

let senderData = senderDoc.data();
let receiverData = receiverDoc.data();

let senderBalance = senderData.availableBalance || 0;
let receiverBalance = receiverData.availableBalance || 0;

/* CHECK BALANCE */
if (senderBalance < amount) {
alert("Sender has insufficient balance");
return;
}

/* UPDATE SENDER */
await updateDoc(
doc(db, "users", senderDoc.id),
{
availableBalance: senderBalance - amount
}
);

/* UPDATE RECEIVER */
await updateDoc(
doc(db, "users", receiverDoc.id),
{
availableBalance: receiverBalance + amount
}
);

/* MARK AS APPROVED */
await updateDoc(
doc(db, "transferRequests", id),
{
status: "approved"
}
);

alert("Transfer approved and completed");

} catch (error) {

console.log(error);
alert("Transfer failed");

}

};

/* REJECT TRANSFER */
window.rejectTransfer = async (id) => {

try {

await updateDoc(
doc(db, "transferRequests", id),
{
status: "rejected"
}
);

alert("Transfer rejected");

} catch (error) {

console.log(error);
alert("Error rejecting transfer");

}

};