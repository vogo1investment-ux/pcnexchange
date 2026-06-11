import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const container = document.getElementById("allMessagesContainer");
const replyUserIdInput = document.getElementById("replyUserIdInput");
const replyMessageInput = document.getElementById("replyMessageInput");
const sendReplyBtn = document.getElementById("sendReplyBtn");

// Admin Auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  } else {
    loadAllMessages();
  }
});

// Load all user messages
async function loadAllMessages() {
  container.innerHTML = `<p class="text-zinc-400">Loading all user messages...</p>`;
  try {
    const q = query(collection(db, "supportMessages"));
    const snap = await getDocs(q);

    container.innerHTML = "";
    if (snap.empty) {
      container.innerHTML = `<p class="text-zinc-400">No support messages found.</p>`;
      return;
    }

    snap.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");
      div.className = "bg-zinc-900 p-4 rounded-xl border border-zinc-700";

      div.innerHTML = `
        <p><strong>UID:</strong> ${msg.userId || "Unknown"}</p>
        <p><strong>Email:</strong> ${msg.userEmail || "Unknown"}</p>
        <p><strong>Subject:</strong> ${msg.subject || "No subject"}</p>
        <p><strong>Message:</strong> ${msg.message || ""}</p>
        <p><strong>Status:</strong> ${msg.status || "pending"}</p>
        <p><strong>Reply:</strong> ${msg.reply || ""}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    container.innerHTML = `<p class="text-red-500">Failed to load messages. Check console.</p>`;
  }
}

// Send reply to specific user message
sendReplyBtn.addEventListener("click", async () => {
  const uid = replyUserIdInput.value.trim();
  const message = replyMessageInput.value.trim();

  if (!uid || !message) {
    alert("Both User UID and message are required.");
    return;
  }

  try {
    const q = query(collection(db, "supportMessages"), where("userId", "==", uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No message found for this UID.");
      return;
    }

    snap.forEach(async docSnap => {
      await updateDoc(doc(db, "supportMessages", docSnap.id), {
        reply: message,
        status: "replied"
      });
    });

    alert("Reply sent successfully!");
    replyUserIdInput.value = "";
    replyMessageInput.value = "";
    loadAllMessages();

  } catch (err) {
    console.error("Failed to send reply:", err);
    alert("Failed to send reply. Check console for details.");
  }
});