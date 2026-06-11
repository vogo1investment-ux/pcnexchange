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

const sendBtn = document.getElementById("sendMessageBtn");
const titleInput = document.getElementById("messageTitle");
const bodyInput = document.getElementById("messageBody");
const messagesContainer = document.getElementById("messagesContainer");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  loadMessages();
});

// Send new message
sendBtn.addEventListener("click", async () => {
  if (!titleInput.value.trim() || !bodyInput.value.trim()) {
    alert("Please enter title and message");
    return;
  }

  try {
    await addDoc(collection(db, "supportMessages"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      title: titleInput.value.trim(),
      message: bodyInput.value.trim(),
      reply: "",
      status: "pending",
      timestamp: serverTimestamp()
    });

    titleInput.value = "";
    bodyInput.value = "";
    alert("Message sent successfully!");
  } catch (err) {
    console.error(err);
    alert("Error sending message. Check network or Firestore rules.");
  }
});

// Load messages
function loadMessages() {
  const q = query(
    collection(db, "supportMessages"),
    where("userId", "==", currentUser.uid),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-zinc-400">No messages yet.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const time = data.timestamp?.toDate?.() || new Date();
      const messageEl = document.createElement("div");
      messageEl.className = "mb-4 p-3 bg-zinc-900 rounded-xl border border-zinc-700";

      messageEl.innerHTML = `
        <p class="font-bold">${data.title || "No Title"}</p>
        <p class="text-zinc-300 mb-1">${data.message}</p>
        <p class="text-sm text-zinc-500">Status: ${data.status}</p>
        <p class="text-sm text-zinc-500">Reply: ${data.reply || "No reply yet"}</p>
        <p class="text-xs text-zinc-500">Sent at: ${time.toLocaleString()}</p>
      `;
      messagesContainer.appendChild(messageEl);
    });
  }, err => {
    console.error(err);
    messagesContainer.innerHTML = `<p class="text-center text-red-500">Failed to load messages. Check console.</p>`;
  });
}