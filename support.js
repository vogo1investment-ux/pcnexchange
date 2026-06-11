import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const messageTitleInput = document.getElementById("messageTitleInput");
const messageContentInput = document.getElementById("messageContentInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let currentUser = null;

// User authentication
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in to access support.");
    window.location.href = "login.html"; // redirect to login
    return;
  }
  currentUser = user;
  loadUserMessages();
});

// Load all user messages
async function loadUserMessages() {
  messagesContainer.innerHTML = `<p class="text-zinc-400">Loading your messages...</p>`;
  try {
    const q = query(
      collection(db, "supportMessages"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);

    messagesContainer.innerHTML = "";
    if (snap.empty) {
      messagesContainer.innerHTML = `<p class="text-zinc-400">You have no messages yet.</p>`;
      return;
    }

    snap.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");
      div.className = "bg-zinc-900 p-4 rounded-xl border border-zinc-700";

      const date = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : "Unknown";

      // Highlight if admin replied and user hasn't read yet
      const replyClass = msg.status === "replied" && !msg.readByUser ? "bg-emerald-900" : "";

      div.classList.add(replyClass);

      div.innerHTML = `
        <p><strong>Title:</strong> ${msg.subject || "No title"}</p>
        <p><strong>Message:</strong> ${msg.message}</p>
        <p><strong>Status:</strong> ${msg.status || "pending"}</p>
        <p><strong>Admin Reply:</strong> ${msg.reply || "No reply yet"}</p>
        <p class="text-sm text-zinc-400"><strong>Sent:</strong> ${date}</p>
      `;
      messagesContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesContainer.innerHTML = `<p class="text-red-500">Failed to load messages. Check console.</p>`;
  }
}

// Send new message
sendMessageBtn.addEventListener("click", async () => {
  const title = messageTitleInput.value.trim();
  const content = messageContentInput.value.trim();

  if (!title || !content) {
    alert("Please fill in both title and message.");
    return;
  }

  try {
    await addDoc(collection(db, "supportMessages"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      subject: title,
      message: content,
      reply: "",
      status: "pending",
      readByUser: true,
      timestamp: serverTimestamp()
    });

    alert("Message sent successfully!");
    messageTitleInput.value = "";
    messageContentInput.value = "";
    loadUserMessages();

  } catch (err) {
    console.error("Failed to send message:", err);
    alert("Failed to send message. Check console.");
  }
});