import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyBp3K3gJtK2XqIm-eVI1osP-Vma3wj1lTs",
authDomain: "jumiastaff-83757.firebaseapp.com",
projectId: "jumiastaff-83757",
storageBucket: "jumiastaff-83757.appspot.com",
messagingSenderId: "1018307795636",
appId: "1:1018307795636:web:6545b94e234fe9fb1ad5e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const historyList = document.getElementById("historyList");

onAuthStateChanged(auth, async (user) => {

if (!user) {
historyList.innerHTML = "<p>Please login first</p>";
return;
}

const q = query(
collection(db, "transactions"),
where("uid", "==", user.uid)
);

const snap = await getDocs(q);

if (snap.empty) {
historyList.innerHTML = "<p class='text-zinc-500'>No transactions yet</p>";
return;
}

snap.forEach(doc => {
const t = doc.data();

historyList.innerHTML += `
<div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
<p class="text-emerald-400 font-bold">${t.type.toUpperCase()}</p>
<p>Amount: $${t.amount}</p>
<p class="text-zinc-500 text-sm">${new Date(t.createdAt).toLocaleString()}</p>
<p class="text-xs ${t.status === 'success' ? 'text-green-400' : 'text-yellow-400'}">
${t.status}
</p>
</div>
`;
});

});