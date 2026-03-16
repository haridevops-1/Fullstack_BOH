import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

let previousStatuses = {}; // Map of donationId -> status

document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth("donor")) return;

  const userName = localStorage.getItem("userName");
  const heading = document.getElementById("welcomeHeading");
  if (heading && userName) heading.innerText = `Welcome, ${userName.trim()}`;

  fetchDonorRecentActivity(true);

  // Poll for status updates every 10 seconds
  setInterval(() => fetchDonorRecentActivity(false), 10000);
});

async function fetchDonorRecentActivity(isInitial = false) {
  const donorId = localStorage.getItem("userId");
  const tableBody = document.querySelector(".donation-table tbody");
  if (!tableBody) return;

  if (isInitial) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading your dashboard...</td></tr>';
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/donor/donations?donor_id=${donorId}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (response.ok) {
      const donations = await response.json();
      let pending = 0,
        accepted = 0,
        rejected = 0,
        completed = 0;

      donations.forEach((d) => {
        const s = d.status.toLowerCase();
        if (s === "pending") pending++;
        else if (["accepted", "reached", "picked"].includes(s)) accepted++;
        else if (s === "rejected") rejected++;
        else if (s === "completed") completed++;

        // Tracking status changes for toasts
        if (
          !isInitial &&
          previousStatuses[d.id] &&
          previousStatuses[d.id] !== s
        ) {
          const statusLabels = {
            accepted: "accepted your request!",
            reached: "reached your location!",
            picked: "picked up the food!",
            completed: "completed the donation!",
            rejected: "declined the request.",
          };
          if (statusLabels[s]) {
            showToast(
              `Update: ${d.trust_name || "A Trust"} has ${statusLabels[s]}`,
              s,
            );
          }
        }
        previousStatuses[d.id] = s;
      });

      document.querySelector(".pending-val").innerText = pending;
      document.querySelector(".accept-val").innerText = accepted;
      document.querySelector(".reject-val").innerText = rejected;
      document.querySelector(".total-val").innerText = completed;

      tableBody.innerHTML = "";
      let shown = 0;

      donations.forEach((item) => {
        const status = item.status.toLowerCase();
        if (status !== "completed" && status !== "rejected" && shown < 5) {
          const row = document.createElement("tr");
          row.style.cursor = "pointer";
          row.onclick = () =>
            (window.location.href = `Donation-tracking.html?id=${item.id}`);

          const catClass =
            item.category === "non-veg"
              ? "non-veg"
              : item.category === "both"
                ? "both"
                : "veg";

          row.innerHTML = `
                        <td style="font-weight:600;">${item.trust_name || "Anonymous Trust"}</td>
                        <td><span class="category-badge ${catClass}">${item.category || "veg"}</span></td>
                        <td>${item.food_name}</td>
                        <td style="font-weight:500;">${item.approx_quantity}</td>
                        <td>${item.city}</td>
                        <td><span class="status ${status}">${item.status}</span></td>
                    `;
          tableBody.appendChild(row);
          shown++;
        }
      });

      if (shown === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">No active donations in progress.</td></tr>';
      }
    }
  } catch (error) {
    if (isInitial) {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Connection error. Please try again.</td></tr>';
    }
  }
}

function showToast(message, status) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast status-update ${status}`;
  const icons = {
    accepted: "✅",
    reached: "📍",
    picked: "📦",
    completed: "🎉",
    rejected: "❌",
  };
  toast.innerHTML = `<span class="toast-icon">${icons[status] || "🔔"}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(() => toast.remove(), 500);
  }, 6000);
}

window.logout = () => {
  localStorage.clear();
  window.location.href = "../index.html";
};
