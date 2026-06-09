import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const walletTableBody = document.getElementById("walletTableBody");
const searchInput = document.getElementById("searchUser");

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "admin-login.html";
    return;
  }
  loadWallets();
});

async function loadWallets() {
  walletTableBody.innerHTML = "<tr><td colspan='5' class='p-2'>Loading wallets...</td></tr>";
  const usersSnap = await getDocs(collection(db, "users"));
  walletTableBody.innerHTML = "";

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    const coinsSnap = await getDocs(collection(db, `users/${userId}/coins`));

    if (coinsSnap.empty) {
      walletTableBody.innerHTML += `
      <tr class="border-b border-zinc-700">
        <td class="p-2">${userId}</td>
        <td class="p-2">${userData.username || "N/A"}</td>
        <td class="p-2">No coins</td>
        <td class="p-2">0.00</td>
        <td class="p-2"></td>
      </tr>`;
    } else {
      coinsSnap.forEach(coinDoc => {
        const coinId = coinDoc.id;
        const coinData = coinDoc.data();
        walletTableBody.innerHTML += `
        <tr class="border-b border-zinc-700">
          <td class="p-2">${userId}</td>
          <td class="p-2">${userData.username || "N/A"}</td>
          <td class="p-2">${coinId}</td>
          <td class="p-2">
            <input type="number" step="0.000001" min="0" value="${coinData.amount || 0}" 
              class="w-24 p-1 rounded bg-zinc-800 text-white" id="coin_${userId}_${coinId}">
          </td>
          <td class="p-2">
            <button onclick="updateCoin('${userId}','${coinId}')" 
              class="bg-emerald-400 text-black font-bold p-2 rounded">Update</button>
          </td>
        </tr>`;
      });
    }
  }
}

// Update function
window.updateCoin = async (userId, coinId) => {
  const input = document.getElementById(`coin_${userId}_${coinId}`);
  const newAmount = parseFloat(input.value) || 0;

  try {
    const coinRef = doc(db, `users/${userId}/coins/${coinId}`);
    await updateDoc(coinRef, { amount: newAmount });
    alert(`Updated ${coinId} for user ${userId} to ${newAmount}`);
  } catch (err) {
    console.error(err);
    alert("Failed to update coin amount.");
  }
};

// Search functionality
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll("#walletTableBody tr").forEach(row => {
    const uid = row.cells[0].innerText.toLowerCase();
    const username = row.cells[1].innerText.toLowerCase();
    row.style.display = uid.includes(filter) || username.includes(filter) ? "" : "none";
  });
});