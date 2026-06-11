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
  } catch (err) {
    console.error(err);
    alert("Error sending message. Check network or Firestore rules.");
  }
});

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
        <p class="font-bold text-emerald-400">${data.title || "No Title"}</p>
        <div class="mb-2">
          <p class="text-zinc-300 font-medium">You:</p>
          <p class="text-zinc-200">${data.message}</p>
        </div>
        <div class="mb-2">
          <p class="text-zinc-300 font-medium">Admin:</p>
          <p class="text-zinc-200">${data.reply || "No reply yet"}</p>
        </div>
        <p class="text-xs text-zinc-500">Status: ${data.status} | Sent: ${time.toLocaleString()}</p>
      `;

      messagesContainer.appendChild(messageEl);
    });
  }, err => {
    console.error(err);
    messagesContainer.innerHTML = `<p class="text-center text-red-500">Failed to load messages. Check console.</p>`;
  });
}