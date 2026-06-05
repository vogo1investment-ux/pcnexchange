import { db } from "./admin-dashboard-full.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function init() {
  const section = document.getElementById("section-content");
  section.innerHTML = `
    <h2 class="text-2xl font-bold text-emerald-400 mb-4">Live Overview</h2>
    <div id="overviewList" class="space-y-2 max-h-[500px] overflow-y-auto p-2 bg-zinc-900 rounded-xl"></div>
  `;

  const overviewList = document.getElementById("overviewList");

  const collections = ["users", "pendingTransactions", "pendingTrades", "kyc", "notifications"];

  collections.forEach(colName => {
    const q = query(collection(db, colName), orderBy("createdAt", "desc"));
    onSnapshot(q, snapshot => {
      let html = "";
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        html += `<div class="p-2 bg-zinc-800 rounded border border-zinc-700">
          <strong>${colName}</strong> - ${JSON.stringify(data)}
        </div>`;
      });
      overviewList.innerHTML = html;
    });
  });
}