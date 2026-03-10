import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

let seenDonationIds = new Set();
let isFirstLoad = true;

document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth("trust")) return;

  const name = localStorage.getItem("userName");
  const heading = document.getElementById("welcomeHeading");
  if (heading && name) heading.innerText = `Welcome, ${name}`;

  fetchTrustStats();
  loadRecentDonations(true);

  const refreshBtn = document.querySelector(".refresh-btn");
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      fetchTrustStats();
      loadRecentDonations(false);
    };
  }

  setInterval(() => {
    fetchTrustStats();
    loadRecentDonations(false);
  }, 10000);
});

async function fetchTrustStats() {
  const trustId = localStorage.getItem("userId");
  try {
    const response = await fetch(`${BACKEND_URL}/api/trust/donations_details?trust_id=${trustId}`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const list = await response.json();
      let pending = 0, accepted = 0, rejected = 0, completed = 0;

      list.forEach(item => {
        const s = item.status.toLowerCase();
        if (s === "pending") pending++;
        else if (["accepted", "reached", "picked"].includes(s)) accepted++;
        else if (s === "rejected") rejected++;
        else if (s === "completed") completed++;
      });

      document.querySelector(".pending").innerText = pending;
      document.querySelector(".accept").innerText = accepted;
      document.querySelector(".reject").innerText = rejected;
      document.querySelector(".completed-count").innerText = completed;

      const footer = document.querySelector(".card-footer-text");
      if (footer) footer.style.display = pending > 0 ? "none" : "block";
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function loadRecentDonations(init = false) {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.querySelector("tbody");
  if (init) tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Looking for active requests...</td></tr>';

  try {
    const response = await fetch(`${BACKEND_URL}/api/trust/donations_details?trust_id=${trustId}`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const donations = await response.json();

      donations.forEach(item => {
        const status = item.status.toLowerCase();
        if (status === "pending" && !seenDonationIds.has(item.id)) {
          if (!init && !isFirstLoad) showToast(`New Incoming Donation: ${item.food_name || "Food Request"}`);
          seenDonationIds.add(item.id);
        } else if (!seenDonationIds.has(item.id)) {
          seenDonationIds.add(item.id);
        }
      });

      isFirstLoad = false;
      tableBody.innerHTML = "";
      let count = 0;

      donations.forEach(item => {
        const status = item.status.toLowerCase();
        if (status !== "completed" && status !== "rejected") {
          const row = document.createElement("tr");
          row.onclick = () => {
            window.location.href = status === "pending" ? `Trust_decision.html?id=${item.id}` : `Trust_update.html?id=${item.id}`;
          };

          const newBadge = status === "pending" ? '<span class="new-badge">NEW</span>' : "";
          const catClass = item.category === "non-veg" ? "non-veg" : (item.category === "both" ? "both" : "veg");

          row.innerHTML = `
                        <td>${item.name || "Anonymous donor"}${newBadge}</td>
                        <td>${item.food_name}</td>
                        <td><span class="category-badge ${catClass}">${item.category || "veg"}</span></td>
                        <td>${item.approx_quantity}</td>
                        <td>${item.city}</td>
                        <td><span class="status ${status}">${item.status}</span></td>
                    `;
          tableBody.appendChild(row);
          count++;
        }
      });

      if (count === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">No active donation requests found.</td></tr>';
      }
    }
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Connection error. Please try again.</td></tr>';
  }
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast incoming";
  toast.innerHTML = `<span class="toast-icon">🛎️</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

window.logout = () => {
  localStorage.clear();
  window.location.href = "../index.html";
};
