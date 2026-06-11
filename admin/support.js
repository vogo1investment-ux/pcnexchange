import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// DOM elements
const messagesContainer = document.getElementById("messagesContainer");
const personalUid = document.getElementById("personalUid");
const personalTitle = document.getElementById("personalTitle");
const personalMessage = document.getElementById("personalMessage");
const sendPersonalBtn = document.getElementById("sendPersonalBtn");

// Admin login check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  loadAllMessages();
});

// Load all user messages
function loadAllMessages() {
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
        <p><strong>User UID:</strong> ${data.userId}</p>
        <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
        <p class="text-xs text-zinc-400">Sent: ${ts}</p>
      `;
      messagesContainer.appendChild(msgDiv);
    });
  });
}

// Send personal message to any user
sendPersonalBtn.addEventListener("click", async () => {
  const uid = personalUid.value.trim();
  if (!uid) return alert("Enter user UID.");
  const title = personalTitle.value.trim();
  const message = personalMessage.value.trim();
  if (!title || !message) return alert("Enter title and message.");

  try {
    await setDoc(doc(db, "supportMessages", `${uid}_${Date.now()}`), {
      userId: uid,
      userEmail: "",
      title,
      message,
      reply: "",
      status: "approved",
      timestamp: new Date()
    });
    personalUid.value = "";
    personalTitle.value = "";
    personalMessage.value = "";
    alert("Message sent to user!");
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }
});