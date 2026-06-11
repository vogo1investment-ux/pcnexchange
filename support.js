import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");

let currentUserUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to access support.");
    window.location.href = "login.html";
    return;
  }
  currentUserUid = user.uid;
  loadUserMessages();
});

sendBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const message = messageInput.value.trim();

  if (!title || !message) {
    alert("Please enter both title and message.");
    return;
  }

  try {
    await addDoc(collection(db, "supportMessages"), {
      userId: currentUserUid,
      title,
      message,
      reply: "",
      status: "pending",
      createdAt: serverTimestamp()
    });

    titleInput.value = "";
    messageInput.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Error sending message. Check network or Firestore rules.");
  }
});

function loadUserMessages() {
  const q = query(
    collection(db, "supportMessages"),
    where("userId", "==", currentUserUid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Unknown date";

      const msgDiv = document.createElement("div");
      msgDiv.className = "mb-4 p-3 rounded-xl bg-zinc-700";

      msgDiv.innerHTML = `
        <p class="font-bold text-emerald-400">${data.title} <span class="text-xs text-zinc-400">(${createdAt})</span></p>
        <p class="mb-2">${data.message}</p>
        <p class="italic text-sm text-pink-400">Admin reply: ${data.reply || "No reply yet"}</p>
        <p class="text-xs text-zinc-400">Status: ${data.status}</p>
      `;
      messagesContainer.appendChild(msgDiv);
    });
  }, (err) => {
    messagesContainer.innerHTML = "<p class='text-red-500'>Failed to load messages. Check console.</p>";
    console.error("Error loading messages:", err);
  });
}