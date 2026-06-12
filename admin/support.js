import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config (your existing config)
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
            <p><strong>Admin Reply:</strong> ${data.reply || "-"}</p>
            <p class="text-xs text-green-300">Sent: ${ts}</p>
            <div class="mt-2">
              <input type="text" placeholder="Reply here..." class="replyInput w-full p-2 rounded-xl bg-green-600 border border-green-500"/>
              <button class="replyBtn bg-green-400 text-black p-2 rounded-xl w-full font-bold mt-1">Send Reply</button>
            </div>
          `;

          // Reply handler
          const replyBtn = div.querySelector(".replyBtn");
          const replyInput = div.querySelector(".replyInput");
          replyBtn.addEventListener("click", async () => {
            const replyText = replyInput.value.trim();
            if (!replyText) return alert("Enter a reply.");
            try {
              await updateDoc(doc(db, `users/${uid}/supportMessages`, msgDoc.id), {
                reply: replyText,
                adminTimestamp: serverTimestamp()
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