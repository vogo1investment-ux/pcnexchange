import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const loadHistoryBtn = document.getElementById("loadHistoryBtn");
  const userIdInput = document.getElementById("userIdInput");
  const historyTableBody = document.getElementById("historyTableBody");

  const addEntryBtn = document.getElementById("addEntryBtn");
  const typeInput = document.getElementById("typeInput");
  const amountInput = document.getElementById("amountInput");
  const methodInput = document.getElementById("methodInput");
  const statusInput = document.getElementById("statusInput");
  const timestampInput = document.getElementById("timestampInput");

  const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

  onAuthStateChanged(auth, user => {
    if (!user || user.uid !== ADMIN_UID) {
      alert("Access Denied: Admin Only");
      window.location.href = "admin-login.html";
      return;
    }
  });

  async function loadHistory() {
    const userId = userIdInput.value.trim();
    if (!userId) return alert("Enter user UID");

    historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Loading...</td></tr>`;

    try {
      const historyCol = collection(db, "users", userId, "history");
      const historySnap = await getDocs(query(historyCol, orderBy("timestamp", "desc")));

      if (historySnap.empty) {
        historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center">No history found.</td></tr>`;
        return;
      }

      historyTableBody.innerHTML = "";
      historySnap.forEach(docSnap => {
        const entry = docSnap.data();
        const entryId = docSnap.id;
        let date;
        if (entry.timestamp?.toDate) date = entry.timestamp.toDate();
        else if (entry.timestamp && typeof entry.timestamp === "number") date = new Date(entry.timestamp);
        else date = new Date();

        historyTableBody.innerHTML += `
          <tr data-id="${entryId}" class="bg-zinc-900 hover:bg-zinc-800">
            <td class="p-2 border border-zinc-700">${entry.type || "-"}</td>
            <td class="p-2 border border-zinc-700">${entry.amount || 0}</td>
            <td class="p-2 border border-zinc-700">${entry.method || "-"}</td>
            <td class="p-2 border border-zinc-700">${entry.status || "-"}</td>
            <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
            <td class="p-2 border border-zinc-700">
              <button class="editBtn bg-blue-500 text-black px-2 py-1 rounded">Edit</button>
              <button class="deleteBtn bg-red-500 text-black px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
        `;
      });

      // Edit/Delete Buttons
      document.querySelectorAll(".editBtn").forEach(btn => {
        btn.onclick = async e => {
          const row = e.target.closest("tr");
          const entryId = row.dataset.id;

          const type = prompt("Type", row.cells[0].innerText);
          const amount = parseFloat(prompt("Amount", row.cells[1].innerText));
          const method = prompt("Method", row.cells[2].innerText);
          const status = prompt("Status", row.cells[3].innerText);
          const timestamp = new Date(prompt("DateTime (YYYY-MM-DD HH:MM)", row.cells[4].innerText));

          if (!type || !amount || !method || !status || !timestamp) return alert("All fields required");
          await updateDoc(doc(db, "users", userId, "history", entryId), { type, amount, method, status, timestamp });
          loadHistory();
        };
      });

      document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.onclick = async e => {
          const row = e.target.closest("tr");
          const entryId = row.dataset.id;
          if (!confirm("Delete this history entry?")) return;
          await deleteDoc(doc(db, "users", userId, "history", entryId));
          loadHistory();
        };
      });

    } catch (err) {
      console.error(err);
      historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Failed to load history. Check console.</td></tr>`;
    }
  }

  loadHistoryBtn.addEventListener("click", loadHistory);

  // Add new history entry
  addEntryBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    if (!userId) return alert("Enter user UID");

    const type = typeInput.value;
    const amount = parseFloat(amountInput.value);
    const method = methodInput.value.trim();
    const status = statusInput.value;
    const timestamp = timestampInput.value ? new Date(timestampInput.value) : new Date();

    if (!type || !amount || !method) return alert("Enter type, amount, method");

    try {
      await addDoc(collection(db, "users", userId, "history"), { type, amount, method, status, timestamp });
      typeInput.value = "Deposit";
      amountInput.value = "";
      methodInput.value = "";
      statusInput.value = "Approved";
      timestampInput.value = "";
      loadHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to add history entry.");
    }
  });
});