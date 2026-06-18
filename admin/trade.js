import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
authDomain: "pcnexchange.firebaseapp.com",
projectId: "pcnexchange",
storageBucket: "pcnexchange.firebasestorage.app",
messagingSenderId: "278761036604",
appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

const btn = document.getElementById("loadRequestsBtn");
const container = document.getElementById("requestsContainer");

if (!btn) {
    console.log("loadRequestsBtn NOT FOUND");
    return;
}

btn.addEventListener("click", async () => {

    container.innerHTML = "Loading...";

    try {

        const snap = await getDocs(
            collection(db, "pendingTransactions")
        );

        container.innerHTML = "";

        snap.forEach(docSnap => {

            const data = docSnap.data();

            const div = document.createElement("div");

            div.style.padding = "10px";
            div.style.margin = "10px";
            div.style.border = "1px solid #00ff88";

            div.innerHTML = `
                <p>User: ${data.userId}</p>
                <p>Coin: ${data.coinId}</p>
                <p>Amount: ${data.amount}</p>
                <p>Status: ${data.status}</p>
            `;

            container.appendChild(div);

        });

        if (snap.empty) {
            container.innerHTML = "No requests found";
        }

    } catch (error) {

        console.error(error);

        container.innerHTML =
        "Firestore Error: " + error.message;

    }

});

});