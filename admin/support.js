import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const container = document.getElementById("supportMessagesContainer");

// Admin Auth Check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadSupportMessages();
});

// Load all support messages
async function loadSupportMessages() {
  container.innerHTML = `<p class="text-zinc-400">Loading messages...</p>`;
  try {
    const messagesSnap = await getDocs(collection(db, "supportMessages"));
    container.innerHTML = "";

    if (messagesSnap.empty) {
      container.innerHTML = `<p class="text-zinc-400">No support messages found.</p>`;
      return;
    }

    messagesSnap.forEach(msgDoc => {
      const msg = msgDoc.data();
      const div = document.createElement("div");
      div.className = "bg-zinc-900 p-4 rounded-xl border border-zinc-700";

      div.innerHTML = `
        <p><strong>User Email:</strong> ${msg.userEmail || "Unknown"}</p>
        <p><strong>Subject:</strong> ${msg.subject || "No subject"}</p>
        <p><strong>Message:</strong> ${msg.message || ""}</p>
        <p><strong>Status:</strong> <span id="status-${msgDoc.id}">${msg.status || "pending"}</span></p>
        <p><strong>Reply:</strong> <span id="reply-${msgDoc.id}">${msg.reply || ""}</span></p>
        <textarea id="replyInput-${msgDoc.id}" placeholder="Type reply..." class="w-full p-2 mt-2 mb-2 rounded bg-black border border-zinc-700"></textarea>
        <button id="replyBtn-${msgDoc.id}" class="bg-emerald-400 text-black font-bold p-2 rounded">Send Reply</button>
      `;

      container.appendChild(div);

      const replyBtn = document.getElementById(`replyBtn-${msgDoc.id}`);
      replyBtn.addEventListener("click", async () => {
        const replyText = document.getElementById(`replyInput-${msgDoc.id}`).value.trim();
        if (!replyText) {
          alert("Reply cannot be empty.");
          return;
        }

        try {
          await updateDoc(doc(db, "supportMessages", msgDoc.id), {
            reply: replyText,
            status: "replied"
          });

          document.getElementById(`reply-${msgDoc.id}`).innerText = replyText;
          document.getElementById(`status-${msgDoc.id}`).innerText = "replied";
          document.getElementById(`replyInput-${msgDoc.id}`).value = "";

          alert("Reply sent successfully!");
        } catch (err) {
          console.error("Failed to send reply:", err);
          alert("Failed to send reply. Check console for details.");
        }
      });
    });

  } catch (err) {
    console.error("Failed to load support messages:", err);
    container.innerHTML = `<p class="text-red-500">Failed to load support messages. Check console.</p>`;
  }
}