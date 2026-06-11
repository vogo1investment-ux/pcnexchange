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

// DOM elements
const sendBtn = document.getElementById("sendMessageBtn");
const titleInput = document.getElementById("messageTitle");
const bodyInput = document.getElementById("messageBody");
const messagesContainer = document.getElementById("messagesContainer");
const loadingText = document.getElementById("loadingText");

// Ensure user is logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in to access support.");
    window.location.href = "login.html"; // redirect if not logged in
    return;
  }

  const userId = user.uid;

  // Send message
  sendBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const message = bodyInput.value.trim();

    if (!title || !message) {
      alert("Please enter both title and message.");
      return;
    }

    try {
      await addDoc(collection(db, "supportMessages"), {
        userId,
        userEmail: user.email || "",
        title,
        message,
        reply: "",
        status: "pending",
        createdAt: serverTimestamp()
      });
      titleInput.value = "";
      bodyInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Error sending message. Check network or Firestore rules.");
    }
  });

  // Load user's messages in real-time
  const q = query(
    collection(db, "supportMessages"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-zinc-400 text-center">No messages yet.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      const timeStr = createdAt.toLocaleString();

      const msgDiv = document.createElement("div");
      msgDiv.className = "p-3 rounded-xl bg-zinc-800 border border-zinc-700";

      msgDiv.innerHTML = `
        <p><span class="font-bold text-emerald-400">${data.title}</span> <span class="text-zinc-400 text-sm">(${timeStr})</span></p>
        <p class="mt-1">${data.message}</p>
        <p class="mt-2 text-sm text-yellow-400">Admin reply: ${data.reply || "No reply yet"}</p>
        <p class="mt-1 text-sm text-zinc-400">Status: ${data.status || "pending"}</p>
      `;

      messagesContainer.appendChild(msgDiv);
    });
  }, err => {
    console.error(err);
    messagesContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load messages. Check console.</p>`;
  });
});