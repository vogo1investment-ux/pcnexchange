import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const messagesContainer = document.getElementById("messagesContainer");

// Inputs for sending personal messages
const personalUid = document.getElementById("personalUid");
const personalTitle = document.getElementById("personalTitle");
const personalMessage = document.getElementById("personalMessage");
const sendPersonalBtn = document.getElementById("sendPersonalBtn");

// Ensure only admin can access
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "login.html";
    return;
  }
  loadAllMessages();
});

// Load all messages from all users
function loadAllMessages() {
  const usersCollection = collection(db, "users");
  onSnapshot(usersCollection, snapshot => {
    messagesContainer.innerHTML = "";
    if (snapshot.empty) {
      messagesContainer.innerHTML = `<p class="text-center text-green-300">No users found.</p>`;
      return;
    }

    snapshot.forEach(userDoc => {
      const uid = userDoc.id;
      const supportCol = collection(db, `users/${uid}/supportMessages`);
      const q = query(supportCol, orderBy("timestamp", "desc"));

      onSnapshot(q, supportSnapshot => {
        supportSnapshot.forEach(msgDoc => {
          const data = msgDoc.data();
          const ts = data.timestamp?.toDate?.().toLocaleString() || "-";

          const div = document.createElement("div");
          div.className = "p-4 bg-green-700 rounded-xl border border-green-600 shadow-lg space-y-2";

          div.innerHTML = `
            <p><strong>UID:</strong> ${uid}</p>
            <p><strong>Email:</strong> ${data.userEmail || "-"}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Admin Reply:</strong> ${data.isAdmin ? "Sent by Admin" : (data.reply || "-")}</p>
            <p class="text-xs text-green-300">Sent: ${ts}</p>
            <div class="mt-2 space-y-1">
              <input type="text" placeholder="Reply here..." class="replyInput w-full p-2 rounded-xl bg-green-600 border border-green-500"/>
              <button class="replyBtn bg-green-400 text-black p-2 rounded-xl w-full font-bold">Send Reply</button>
            </div>
          `;

          // Reply handler (creates new admin message with isAdmin: true)
          const replyBtn = div.querySelector(".replyBtn");
          const replyInput = div.querySelector(".replyInput");
          replyBtn.addEventListener("click", async () => {
            const replyText = replyInput.value.trim();
            if (!replyText) return alert("Enter a reply.");
            try {
              const docId = `${uid}_${Date.now()}`;
              await setDoc(doc(db, `users/${uid}/supportMessages`, docId), {
                userId: uid,
                userEmail: "", // optional
                title: "Admin Reply",
                message: replyText,
                isAdmin: true,
                timestamp: serverTimestamp()
              });
              replyInput.value = "";
              alert("Reply sent successfully!");
            } catch (err) {
              console.error(err);
              alert("Failed to send reply.");
            }
          });

          messagesContainer.appendChild(div);
        });
      });
    });
  });
}

// Send new personal message to user (admin-created message)
sendPersonalBtn.addEventListener("click", async () => {
  const uid = personalUid.value.trim();
  const title = personalTitle.value.trim();
  const message = personalMessage.value.trim();

  if (!uid || !title || !message) return alert("Enter UID, title, and message.");

  try {
    const docId = `${uid}_${Date.now()}`;
    await setDoc(doc(db, `users/${uid}/supportMessages`, docId), {
      userId: uid,
      userEmail: "",
      title,
      message,
      isAdmin: true,
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