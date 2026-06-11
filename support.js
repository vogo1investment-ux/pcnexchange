import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
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

const sendBtn = document.getElementById("sendMessageBtn");
const subjectInput = document.getElementById("subjectInput");
const messageInput = document.getElementById("messageInput");
const tableBody = document.getElementById("messagesTableBody");

// Auth check
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login to access support.");
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  loadMessages(uid);

  // Send new message
  sendBtn.addEventListener("click", async () => {
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();
    if (!subject || !message) return alert("Please enter subject and message");

    try {
      await addDoc(collection(db, "supportMessages"), {
        userId: uid,
        userEmail: user.email || "",
        subject,
        message,
        reply: "",
        status: "pending",
        timestamp: serverTimestamp()
      });
      alert("Message sent successfully!");
      subjectInput.value = "";
      messageInput.value = "";
      loadMessages(uid); // refresh messages
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  });
});

// Load user messages
async function loadMessages(uid) {
  tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>`;
  try {
    const q = query(
      collection(db, "supportMessages"),
      where("userId", "==", uid),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No messages found</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : "-";
      const row = document.createElement("tr");
      row.classList.add("bg-zinc-800", "hover:bg-zinc-700");

      row.innerHTML = `
        <td class="p-2 border border-zinc-700">${data.subject || "-"}</td>
        <td class="p-2 border border-zinc-700">${data.message || "-"}</td>
        <td class="p-2 border border-zinc-700">${data.reply || "-"}</td>
        <td class="p-2 border border-zinc-700">${data.status || "pending"}</td>
        <td class="p-2 border border-zinc-700">${ts}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Failed to load messages</td></tr>`;
  }
}