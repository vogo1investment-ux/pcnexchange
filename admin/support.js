import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const messagesContainer = document.getElementById("messagesContainer");
const replyMessageId = document.getElementById("replyMessageId");
const replyText = document.getElementById("replyText");
const statusSelect = document.getElementById("statusSelect");
const sendReplyBtn = document.getElementById("sendReplyBtn");

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  listenAllMessages();
});

function listenAllMessages() {
  const q = query(collection(db, "supportMessages"), orderBy("timestamp", "desc"));

  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-zinc-400">No messages found.</p>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

      const msgDiv = document.createElement("div");
      msgDiv.className = "p-3 bg-zinc-700 rounded-xl border border-zinc-600";

      msgDiv.innerHTML = `
        <p><strong>ID:</strong> ${docSnap.id}</p>
        <p><strong>User UID:</strong> ${data.userId}</p>
        <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
        <p class="text-xs text-zinc-400">Sent: ${ts}</p>
      `;
      messagesContainer.appendChild(msgDiv);
    });
  }, err => {
    console.error(err);
    messagesContainer.innerHTML = `<p class="text-center text-red-500">Failed to load messages.</p>`;
  });
}

// Admin reply & status update
sendReplyBtn.addEventListener("click", async () => {
  const msgId = replyMessageId.value.trim();
  const reply = replyText.value.trim();
  const status = statusSelect.value;

  if (!msgId) return alert("Enter Message ID to reply/update.");

  try {
    const msgRef = doc(db, "supportMessages", msgId);
    await updateDoc(msgRef, { reply, status });
    replyMessageId.value = "";
    replyText.value = "";
    alert("Reply/status updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Failed to update message. Check Firestore rules and console.");
  }
});