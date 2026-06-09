import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");

// Admin auth check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadUsers();
});

async function loadUsers() {
  usersTableBody.innerHTML = "<tr><td colspan='5' class='p-2'>Loading...</td></tr>";

  const usersSnap = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();
    const name = userData.name || "-";

    // Fetch coins subcollection for each user
    const coinsSnap = await getDocs(collection(db, `users/${uid}/coins`));
    if (coinsSnap.empty) {
      usersTableBody.innerHTML += `
        <tr class="border-b border-zinc-700">
          <td class="p-2">${uid}</td>
          <td class="p-2">${name}</td>
          <td class="p-2">No coins</td>
          <td class="p-2">0.00</td>
          <td class="p-2"><button data-uid="${uid}" data-coin="" class="updateBtn bg-emerald-400 text-black p-1 rounded">Update</button></td>
        </tr>`;
    } else {
      coinsSnap.forEach(coinDoc => {
        const c = coinDoc.data();
        const coin = c.coin || "Unknown";
        const amount = c.amount || 0;

        usersTableBody.innerHTML += `
          <tr class="border-b border-zinc-700">
            <td class="p-2">${uid}</td>
            <td class="p-2">${name}</td>
            <td class="p-2">${coin}</td>
            <td class="p-2">
              <input type="number" value="${amount}" min="0" step="0.00000001" class="amountInput w-full p-1 bg-zinc-800 text-white rounded" data-uid="${uid}" data-coin="${coin}">
            </td>
            <td class="p-2">
              <button data-uid="${uid}" data-coin="${coin}" class="updateBtn bg-emerald-400 text-black p-1 rounded">Update</button>
            </td>
          </tr>`;
      });
    }
  }

  // Attach update events
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.uid;
      const coin = btn.dataset.coin;
      const input = document.querySelector(`.amountInput[data-uid="${uid}"][data-coin="${coin}"]`);
      const newAmount = parseFloat(input.value) || 0;

      try {
        await updateDoc(doc(db, `users/${uid}/coins/${coin}`), { amount: newAmount });
        alert(`Updated ${coin} for ${uid} to ${newAmount}`);
      } catch (err) {
        console.error(err);
        alert("Failed to update coin.");
      }
    });
  });
}

// Optional: search
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  document.querySelectorAll("#usersTableBody tr").forEach(row => {
    const uid = row.cells[0].innerText.toLowerCase();
    const name = row.cells[1].innerText.toLowerCase();
    row.style.display = uid.includes(q) || name.includes(q) ? "" : "none";
  });
});