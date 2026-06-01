import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if(!user) {
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  loadMessages();
});

sendBtn.addEventListener("click", async () => {
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();
  if(!subject || !message) return alert("Subject and message cannot be empty.");

  await addDoc(collection(db, "supportMessages"), {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    subject,
    message,
    reply: "",
    status: "pending",
    timestamp: Date.now()
  });

  subjectInput.value = "";
  messageInput.value = "";
  alert("Message sent. We'll reply soon.");
});

function loadMessages() {
  const q = query(collection(db, "supportMessages"), where("userId", "==", currentUser.uid));
  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "message-card";
      card.innerHTML = `
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p>${data.message}</p>
        ${data.reply ? `<p class="reply"><strong>Reply:</strong> ${data.reply}</p>` : `<p class="reply">No reply yet</p>`}
      `;
      messagesContainer.appendChild(card);
    });
  });
}