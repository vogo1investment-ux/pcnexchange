import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");

let currentUser;

// Check user login
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login to access support.");
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
  if (!title || !message) {
    alert("Please enter both subject and message.");
    return;
  }

  try {
    await addDoc(collection(db, "supportMessages"), {
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      subject: title,
      message: message,
      reply: "",
      status: "pending",
      timestamp: serverTimestamp()
    });

    titleInput.value = "";
    messageInput.value = "";
    messageInput.value = "";
    loadMessages();
  } catch (err) {
    console.error("Failed to send message:", err);
    alert("Error sending message. Check network or rules.");
  }
});

// Load user messages
async function loadMessages() {
  messagesContainer.innerHTML = "<p class='text-center text-zinc-400'>Loading your messages...</p>";
  try {
    const q = query(
      collection(db, "supportMessages"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      messagesContainer.innerHTML = "<p class='text-center text-zinc-400'>No messages yet.</p>";
      return;
    }

    messagesContainer.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("mb-4", "p-3", "bg-zinc-800", "rounded-xl");
      msgDiv.innerHTML = `
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "<em>No reply yet</em>"}</p>
        <p class="text-xs text-zinc-500">${data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : ""}</p>
      `;
      messagesContainer.appendChild(msgDiv);
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load messages. Check console.</p>";
  }
}