import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const coinsList = document.getElementById("coins-list");
const addBtn = document.getElementById("addCoinBtn");

async function loadCoins() {
  const snap = await getDocs(collection(db, "coins"));
  let html = "";
  snap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2 flex flex-col md:flex-row justify-between items-center">
      <div class="flex flex-col md:flex-row gap-2">
        <input class="p-1 rounded bg-zinc-900 text-white" value="${c.name}" id="name-${docSnap.id}">
        <input class="p-1 rounded bg-zinc-900 text-white" value="${c.price}" id="price-${docSnap.id}">
        <input class="p-1 rounded bg-zinc-900 text-white" value="${c.description || ''}" id="desc-${docSnap.id}">
      </div>
      <div class="flex gap-2 mt-2 md:mt-0">
        <button onclick="updateCoin('${docSnap.id}')" class="bg-emerald-400 p-1 rounded">Update</button>
        <button onclick="deleteCoin('${docSnap.id}')" class="bg-red-500 p-1 rounded">Delete</button>
      </div>
    </div>`;
  });
  coinsList.innerHTML = html;
}

window.updateCoin = async (id) => {
  const name = document.getElementById(`name-${id}`).value.trim();
  const price = document.getElementById(`price-${id}`).value.trim();
  const desc = document.getElementById(`desc-${id}`).value.trim();

  await updateDoc(doc(db, "coins", id), { name, price, description: desc });
  alert("Coin updated!");
  loadCoins();
};

window.deleteCoin = async (id) => {
  if(confirm("Are you sure you want to delete this coin?")){
    await deleteDoc(doc(db, "coins", id));
    loadCoins();
  }
};

addBtn.addEventListener("click", async () => {
  const name = document.getElementById("newCoinName").value.trim();
  const price = document.getElementById("newCoinPrice").value.trim();
  const desc = document.getElementById("newCoinDesc").value.trim();

  if(!name || !price) return alert("Enter coin name and price");

  await addDoc(collection(db, "coins"), { name, price, description: desc });
  document.getElementById("newCoinName").value = "";
  document.getElementById("newCoinPrice").value = "";
  document.getElementById("newCoinDesc").value = "";
  loadCoins();
});

loadCoins();