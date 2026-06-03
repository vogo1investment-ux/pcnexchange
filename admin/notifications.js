import { db, auth } from "./admin-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { onAdminAuth } from "./admin-auth.js";

onAdminAuth(async () => {
  const sendBtn = document.getElementById("sendNotifyBtn");
  sendBtn.addEventListener("click", async () => {
    const uid = document.getElementById("notifyUser").value.trim();
    const msg = document.getElementById("notifyMessage").value.trim();
    if (!msg) return alert("Enter a message");

    if (uid) {
      await addDoc(collection(db, "notifications"), { userId: uid, message: msg, createdAt: Date.now() });
    } else {
      await addDoc(collection(db, "notifications"), { userId: null, message: msg, createdAt: Date.now() });
    }

    alert("Notification sent!");
    document.getElementById("notifyMessage").value = "";
    document.getElementById("notifyUser").value = "";
  });
});