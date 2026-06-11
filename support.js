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

const subjectInput = document.getElementById("subjectInput");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");

let currentUser;

// Wait for user authentication
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in to access support.");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  loadMessages(); // Load their messages
});

// Send a new message
sendBtn.addEventListener("click", async () => {
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();
  if (!subject || !message) return alert("Please enter both subject and message");

  try {
    await addDoc(collection(db, "supportMessages"), {
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      subject: subject,
      message: message,
      reply: "",
      status: "pending",
      timestamp: serverTimestamp()
    });
    subjectInput.value = "";
    messageInput.value = "";
    loadMessages(); // Refresh the list
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message. Check your network or Firestore rules.");
  }
});

// Load all messages for this user
async function loadMessages() {
  messagesContainer.innerHTML = "<p class='text-center text-zinc-400'>Loading your messages...</p>";
  try {
    const q = query(
      collection(db, "supportMessages"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      messagesContainer.innerHTML = "<p class='text-center text-zinc-400'>No messages yet.</p>";
      return;
    }

    messagesContainer.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : "-";
      const div = document.createElement("div");
      div.className = "mb-4 p-3 bg-zinc-800 rounded-xl";
      div.innerHTML = `
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "<em>No reply yet</em>"}</p>
        <p class="text-xs text-zinc-400"><strong>Sent:</strong> ${ts}</p>
      `;
      messagesContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load messages. Check console.</p>";
  }
}