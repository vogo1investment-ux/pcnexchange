import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

let currentUser = null;

// Elements
const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");

// Wait for auth
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in!");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  loadMessages();
});

// Send message
sendBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const message = messageInput.value.trim();
  if (!title || !message) return alert("Please enter a title and message.");

  try {
    await addDoc(collection(db, "users", currentUser.uid, "supportMessages"), {
      title,
      message,
      reply: "",
      status: "pending",
      timestamp: serverTimestamp(),
      userEmail: currentUser.email,
      userId: currentUser.uid
    });

    titleInput.value = "";
    messageInput.value = "";
    messageInput.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Error sending message. Check network or Firestore rules.");
  }
});

// Load user messages in real-time
function loadMessages() {
  const q = query(
    collection(db, "users", currentUser.uid, "supportMessages"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-zinc-500">No messages yet.</p>`;
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const time = data.timestamp?.toDate?.()?.toLocaleString() || "Unknown Time";

      const msgDiv = document.createElement("div");
      msgDiv.className = "mb-3 p-3 bg-zinc-800 rounded-xl";

      msgDiv.innerHTML = `
        <p class="font-bold text-emerald-400">${data.title || "No Title"}</p>
        <p>${data.message}</p>
        <p class="mt-1 text-sm text-zinc-400">Admin Reply: ${data.reply || "No reply yet"}</p>
        <p class="mt-1 text-xs text-zinc-500">Status: ${data.status || "pending"} | ${time}</p>
      `;
      messagesContainer.appendChild(msgDiv);
    });
  }, (err) => {
    console.error("Failed to load messages:", err);
    messagesContainer.innerHTML = `<p class="text-center text-red-500">Failed to load messages. Check console.</p>`;
  });
}