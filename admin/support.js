import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ------------------ Firebase Config ------------------
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

// ------------------ Admin UID ------------------
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// ------------------ DOM Elements ------------------
const messagesContainer = document.getElementById("messagesContainer");
const personalUid = document.getElementById("personalUid");
const personalTitle = document.getElementById("personalTitle");
const personalMessage = document.getElementById("personalMessage");
const sendPersonalBtn = document.getElementById("sendPersonalBtn");

// ------------------ Admin Login Check ------------------
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  loadAllMessages();
});

// ------------------ Load All Messages ------------------
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
      div.className = "p-4 bg-green-900 rounded-xl border border-green-700 shadow-lg";

      div.innerHTML = `
        <p><strong>User UID:</strong> ${data.userId}</p>
        <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
        <p class="text-xs text-green-300">Sent: ${ts}</p>
      `;
      messagesContainer.appendChild(div);
    });
  }, error => {
    messagesContainer.innerHTML = `<p class="text-center text-red-400">Failed to load messages: ${error.message}</p>`;
    console.error(error);
  });
}

// ------------------ Send Personal Message ------------------
sendPersonalBtn.addEventListener("click", async () => {
  const uid = personalUid.value.trim();
  const title = personalTitle.value.trim();
  const message = personalMessage.value.trim();

  if (!uid || !title || !message) return alert("Enter UID, title, and message.");

  try {
    // Create a new document with a unique ID
    const docId = `${uid}_${Date.now()}`;
    await setDoc(doc(db, "supportMessages", docId), {
      userId: uid,
      userEmail: "", // optional, admin can fill
      title,
      message,
      reply: "",
      status: "pending",
      timestamp: serverTimestamp()
    });

    personalUid.value = "";
    personalTitle.value = "";
    personalMessage.value = "";
    alert("Message sent successfully!");

  } catch (err) {
    console.error(err);
    alert("Failed to send message. Check console.");
  }
});