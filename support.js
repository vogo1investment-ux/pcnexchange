import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// Elements
const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendMessageBtn");
const messagesDiv = document.getElementById("messagesList");

// Current user UID
let currentUserUID = "";

// Auth check
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }
  currentUserUID = user.uid;
  listenMessages();
});

// Send message
sendBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const message = messageInput.value.trim();
  if (!title || !message) {
    alert("Enter title and message");
    return;
  }
  try {
    await addDoc(collection(db, "users", currentUserUID, "supportMessages"), {
      title,
      message,
      status: "pending",
      reply: "",
      timestamp: serverTimestamp()
    });
    titleInput.value = "";
    messageInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Error sending message. Check network or Firestore rules.");
  }
});

// Listen messages
function listenMessages() {
  const q = query(
    collection(db, "users", currentUserUID, "supportMessages"),
    orderBy("timestamp", "desc")
  );
  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    if (snapshot.empty) {
      messagesDiv.innerHTML = `<p class="text-red-500">No messages yet.</p>`;
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      const ts = data.timestamp ? data.timestamp.toDate().toLocaleString() : "";
      messagesDiv.innerHTML += `
        <div class="mb-4 p-3 bg-zinc-800 rounded-xl">
          <p><strong>${data.title}</strong></p>
          <p>${data.message}</p>
          <p class="text-sm text-zinc-400">Admin Reply: ${data.reply || "-"}</p>
          <p class="text-xs text-zinc-500">${ts}</p>
        </div>
      `;
    });
  }, error => {
    console.error("Failed to load messages:", error);
    messagesDiv.innerHTML = `<p class="text-red-500">Failed to load messages. Check console.</p>`;
  });
}