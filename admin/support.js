import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// DOM Elements
const messagesContainer = document.getElementById("messagesContainer");
const personalUid = document.getElementById("personalUid");
const personalTitle = document.getElementById("personalTitle");
const personalMessage = document.getElementById("personalMessage");
const sendPersonalBtn = document.getElementById("sendPersonalBtn");

// Admin check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  loadAllMessages();
});

// Load messages from Firestore
function loadAllMessages() {
  const q = query(collection(db, "supportMessages"), orderBy("timestamp", "desc"));
  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-green-300">No messages found.</p>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

      const div = document.createElement("div");
      div.className = "p-4 bg-green-800 rounded-xl border border-green-600 shadow-lg space-y-1";

      div.innerHTML = `
        <p><strong>User UID:</strong> ${data.userId}</p>
        <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
        <p class="text-xs text-green-300">Sent: ${ts}</p>
        <div class="mt-2 space-y-1">
          <input type="text" placeholder="Reply here..." class="replyInput w-full p-2 rounded-xl bg-green-700 border border-green-600"/>
          <button class="replyBtn bg-green-400 text-black p-2 rounded-xl w-full font-bold">Send Reply</button>
        </div>
      `;

      // Reply button handler
      const replyBtn = div.querySelector(".replyBtn");
      const replyInput = div.querySelector(".replyInput");
      replyBtn.addEventListener("click", async () => {
        const replyText = replyInput.value.trim();
        if (!replyText) return alert("Enter a reply.");
        try {
          await updateDoc(doc(db, "supportMessages", docSnap.id), { reply: replyText });
          replyInput.value = "";
          alert("Reply sent successfully!");
        } catch (err) {
          console.error(err);
          alert("Failed to send reply.");
        }
      });

      messagesContainer.appendChild(div);
    });
  }, error => {
    messagesContainer.innerHTML = `<p class="text-center text-red-400">Failed to load messages: ${error.message}</p>`;
    console.error(error);
  });
}

// Send new personal message
sendPersonalBtn.addEventListener("click", async () => {
  const uid = personalUid.value.trim();
  const title = personalTitle.value.trim();
  const message = personalMessage.value.trim();

  if (!uid || !title || !message) return alert("Enter UID, title, and message.");

  try {
    const docId = `${uid}_${Date.now()}`;
    await setDoc(doc(db, "supportMessages", docId), {
      userId: uid,
      userEmail: "",
      title,
      message,
      reply: "",
      status: "approved",
      timestamp: serverTimestamp()
    });
    personalUid.value = "";
    personalTitle.value = "";
    personalMessage.value = "";
    alert("Message sent to user!");
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }
});