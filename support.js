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
const messageTitle = document.getElementById("messageTitle");
const messageBody = document.getElementById("messageBody");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const userMessagesContainer = document.getElementById("userMessagesContainer");

// Logged-in user
let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  loadUserMessages();
});

// Send a new message
sendMessageBtn.addEventListener("click", async () => {
  const title = messageTitle.value.trim();
  const body = messageBody.value.trim();
  if (!title || !body) return alert("Enter title and message.");

  try {
    const docId = `${currentUser.uid}_${Date.now()}`;
    await setDoc(doc(db, "supportMessages", docId), {
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      title,
      message: body,
      reply: "",
      status: "pending",
      timestamp: serverTimestamp()
    });
    messageTitle.value = "";
    messageBody.value = "";
    alert("Message sent to admin!");
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }
});

// Load user's messages in real-time
function loadUserMessages() {
  const q = query(
    collection(db, "supportMessages"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snapshot => {
    userMessagesContainer.innerHTML = "";
    const userMessages = snapshot.docs.filter(d => d.data().userId === currentUser.uid);

    if (userMessages.length === 0) {
      userMessagesContainer.innerHTML = `<p class="text-center text-green-300">No messages found.</p>`;
      return;
    }

    userMessages.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

      const div = document.createElement("div");
      div.className = "p-3 bg-green-800 rounded-xl border border-green-600 shadow-md space-y-1";

      div.innerHTML = `
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
        <p class="text-xs text-green-300">Sent: ${ts}</p>
      `;

      userMessagesContainer.appendChild(div);
    });
  }, error => {
    userMessagesContainer.innerHTML = `<p class="text-center text-red-400">Failed to load messages: ${error.message}</p>`;
    console.error(error);
  });
}