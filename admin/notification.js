import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const jsonFileInput = document.getElementById("jsonFileInput");
const uploadBtn = document.getElementById("uploadBtn");
const statusDiv = document.getElementById("status");
const progressTableBody = document.querySelector("#progressTable tbody");

let adminUid = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("You must log in as admin to upload coins.");
    window.location.href = "index.html";
    return;
  }
  adminUid = user.uid;
  if(adminUid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12"){
    alert("You are not authorized to upload coins.");
    window.location.href = "index.html";
    return;
  }
});

uploadBtn.addEventListener("click", async () => {
  const file = jsonFileInput.files[0];
  if (!file) {
    alert("Please select a JSON file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);
      if(!Array.isArray(jsonData)){
        alert("Invalid JSON format. Must be an array of coins.");
        return;
      }

      progressTableBody.innerHTML = "";
      statusDiv.innerText = "Uploading coins...";

      let uploadedCount = 0;

      for(const coin of jsonData){
        const row = document.createElement("tr");
        const symbolCell = document.createElement("td");
        symbolCell.innerText = coin.symbol || "N/A";
        const nameCell = document.createElement("td");
        nameCell.innerText = coin.name || "N/A";
        const statusCell = document.createElement("td");
        statusCell.innerText = "Pending...";
        row.append(symbolCell, nameCell, statusCell);
        progressTableBody.appendChild(row);

        try {
          if(!coin.symbol) throw new Error("Missing symbol");
          const coinRef = doc(db, "coins", coin.symbol);
          await setDoc(coinRef, coin); // overwrite/add
          statusCell.innerText = "Uploaded";
          statusCell.classList.add("success");
          uploadedCount++;
        } catch(err) {
          statusCell.innerText = "Failed";
          statusCell.classList.add("fail");
          console.error("Failed to upload coin:", coin, err);
        }
      }

      statusDiv.innerText = `Upload complete: ${uploadedCount}/${jsonData.length} coins uploaded.`;

    } catch(err) {
      console.error(err);
      alert("Failed to read JSON file. Check console.");
    }
  };
  reader.readAsText(file);
});