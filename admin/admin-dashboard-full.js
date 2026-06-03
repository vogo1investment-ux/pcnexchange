import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Only allow admin UID
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

function adminAuth(callback) {
  onAuthStateChanged(auth, user => {
    if (!user || user.uid !== ADMIN_UID) {
      alert("Access Denied. Admin only.");
      window.location.href = "admin-login.html";
    } else {
      callback(user);
    }
  });
}

// Example usage for Coins Section
export function loadCoins() {
  adminAuth(async () => {
    const coinsSnap = await getDocs(collection(db, "coins"));
    let html = "";
    coinsSnap.forEach(docSnap => {
      const coin = docSnap.data();
      html += `<div class="coin-item">
        <input id="name-${docSnap.id}" value="${coin.name}">
        <input id="price-${docSnap.id}" value="${coin.price}">
        <input id="desc-${docSnap.id}" value="${coin.description || ''}">
        <button onclick="updateCoin('${docSnap.id}')">Update</button>
        <button onclick="deleteCoin('${docSnap.id}')">Delete</button>
      </div>`;
    });
    document.getElementById("coins-list").innerHTML = html;
  });
}

// Update a coin
export async function updateCoin(id) {
  const name = document.getElementById(`name-${id}`).value.trim();
  const price = document.getElementById(`price-${id}`).value.trim();
  const desc = document.getElementById(`desc-${id}`).value.trim();

  await updateDoc(doc(db, "coins", id), { name, price, description: desc });
  alert("Coin updated!");
  loadCoins();
}

// Delete a coin
export async function deleteCoin(id) {
  if (confirm("Delete this coin?")) {
    await deleteDoc(doc(db, "coins", id));
    loadCoins();
  }
}

// Add new coin
export async function addCoin(name, price, desc) {
  await addDoc(collection(db, "coins"), { name, price, description: desc });
  loadCoins();
}