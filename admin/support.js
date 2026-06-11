import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// DOM
const messagesContainer = document.getElementById("messagesContainer");
const replyUid = document.getElementById("replyUid");
const replyTitle = document.getElementById("replyTitle");
const replyMessage = document.getElementById("replyMessage");
const sendReplyBtn = document.getElementById("sendReplyBtn");

// Admin login check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  loadAllMessages();
});

// Load all user messages from `users/{uid}/supportMessages`
function loadAllMessages() {
  const usersCollection = collection(db, "users");
  onSnapshot(usersCollection, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-gray-400">No users found.</p>`;
      return;
    }
    snapshot.forEach(userDoc => {
      const uid = userDoc.id;
      const supportCol = collection(db, `users/${uid}/supportMessages`);
      const q = query(supportCol, orderBy("timestamp", "desc"));
      onSnapshot(q, snap => {
        snap.forEach(msgDoc => {
          const data = msgDoc.data();
          const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

          const div = document.createElement("div");
          div.className = "p-4 bg-gray-700 rounded-xl border border-gray-600";

          div.innerHTML = `
            <p><strong>UID:</strong> ${uid}</p>
            <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
            <p class="text-xs text-gray-400">Sent: ${ts}</p>
          `;
          messagesContainer.appendChild(div);
        });
      });
    });
  });
}

// Send reply to a specific user
sendReplyBtn.addEventListener("click", async () => {
  const uid = replyUid.value.trim();
  const title = replyTitle.value.trim();
  const msg = replyMessage.value.trim();
  if (!uid || !title || !msg) return alert("Fill UID, title, and message.");

  try {
    const docRef = doc(db, `users/${uid}/supportMessages`, `admin_${Date.now()}`);
    await setDoc(docRef, {
      userId: uid,
      userEmail: "",
      title,
      message: "",
      reply: msg,
      status: "approved",
      timestamp: new Date()
    });
    replyUid.value = "";
    replyTitle.value = "";
    replyMessage.value = "";
    alert("Message sent to user successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to send message. Check console.");
  }
});