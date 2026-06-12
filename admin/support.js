import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// DOM Elements
const chatContainer = document.getElementById("chatContainer");
const chatTitle = document.getElementById("chatTitle");
const chatMessage = document.getElementById("chatMessage");
const sendChatBtn = document.getElementById("sendChatBtn");

let currentUser = null;

// Check if user is logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  loadChatMessages();
});

// Load all messages for the current user
function loadChatMessages() {
  const supportCol = collection(db, `users/${currentUser.uid}/supportMessages`);
  const q = query(supportCol, orderBy("timestamp", "asc"));

  onSnapshot(q, snapshot => {
    chatContainer.innerHTML = "";

    if (snapshot.empty) {
      chatContainer.innerHTML = `<p class="text-center text-green-300">No messages yet.</p>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

      const div = document.createElement("div");

      if (data.isAdmin) {
        // Admin message → left
        div.className = "bg-green-600 text-left p-3 rounded-xl max-w-[80%]";
      } else {
        // User message → right
        div.className = "bg-green-700 text-right p-3 rounded-xl max-w-[80%] ml-auto";
      }

      div.innerHTML = `
        <p class="font-bold">${data.isAdmin ? "Admin" : "You"}${data.title ? ` - ${data.title}` : ""}</p>
        <p>${data.message}</p>
        <p class="text-xs text-green-300 mt-1">${ts}</p>
      `;

      chatContainer.appendChild(div);
    });

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, error => {
    chatContainer.innerHTML = `<p class="text-center text-red-400">Failed to load messages: ${error.message}</p>`;
    console.error(error);
  });
}

// Send a new message to admin
sendChatBtn.addEventListener("click", async () => {
  const title = chatTitle.value.trim();
  const message = chatMessage.value.trim();
  if (!title || !message) return alert("Enter title and message.");

  try {
    const docId = `${currentUser.uid}_${Date.now()}`;
    await setDoc(doc(db, `users/${currentUser.uid}/supportMessages`, docId), {
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      title,
      message,
      isAdmin: false,
      timestamp: serverTimestamp()
    });

    chatTitle.value = "";
    chatMessage.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }
});