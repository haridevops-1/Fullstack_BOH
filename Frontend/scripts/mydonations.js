import { BACKEND_URL, getAuthHeaders, formatDate } from './api.js';

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadDonationHistory();
});

async function loadDonationHistory() {
  const donorId = localStorage.getItem("userId");
  const tableBody = document.querySelector("tbody");
  const pageTitle = document.getElementById("pageTitle");

  // Get filter from URL
  const params = new URLSearchParams(window.location.search);
  const filterStatus = params.get("status");

  // Update page title based on filter
  if (!filterStatus) {
    pageTitle.innerText = "All My Donations";
  } else {
    const title = filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);
    pageTitle.innerText = title + " Donations";
  }

  const isRejectedPage = (filterStatus && filterStatus.toLowerCase() === "rejected");
  if (isRejectedPage) {
    const actionHeader = document.querySelector("th:nth-child(8)");
    if (actionHeader) actionHeader.style.display = "none";
  }

  tableBody.innerHTML = `<tr><td colspan="${isRejectedPage ? '7' : '8'}" style="text-align:center;padding:20px;">Searching for records...</td></tr>`;

  try {
    const response = await fetch(`${BACKEND_URL}/api/donor/donations?donor_id=${donorId}`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const donations = await response.json();
      tableBody.innerHTML = "";
      let count = 0;

      donations.forEach(item => {
        const status = item.status.toLowerCase();
        let show = false;

        if (!filterStatus) {
          show = true;
        } else if (filterStatus === "accepted") {
          if (["accepted", "reached", "picked"].includes(status)) {
            show = true;
          }
        } else if (status === filterStatus.toLowerCase()) {
          show = true;
        }

        if (show) {
          const row = document.createElement("tr");
          row.className = "donation-row";

          const dateString = formatDate(item.created_at);
          const catClass = item.category === "non-veg" ? "non-veg" : (item.category === "both" ? "both" : "veg");
          const actionCell = isRejectedPage ? "" : '<td><button class="track-btn">Track</button></td>';

          row.innerHTML = `
            <td>${item.trust_name || "Anonymous Trust"}</td>
            <td>${item.food_name}</td>
            <td><span class="category-badge ${catClass}">${item.category || "veg"}</span></td>
            <td>${item.approx_quantity}</td>
            <td>${item.address}, ${item.city}</td>
            <td><span class="status ${status}">${item.status}</span></td>
            <td>${dateString}</td>
            ${actionCell}
          `;

          const trackBtn = row.querySelector(".track-btn");
          if (trackBtn) {
            trackBtn.onclick = () => {
              window.location.href = `Donation-tracking.html?id=${item.id}`;
            };
          }

          tableBody.appendChild(row);
          count++;
        }
      });

      if (count === 0) {
        tableBody.innerHTML = `<tr><td colspan="${isRejectedPage ? '7' : '8'}" style="text-align:center;padding:40px;color:#94a3b8;">No matching donations found.</td></tr>`;
      }
    } else {
      tableBody.innerHTML = `<tr><td colspan="${isRejectedPage ? '7' : '8'}" style="text-align:center;padding:20px;color:red;">Could not load your records.</td></tr>`;
    }
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="${isRejectedPage ? '7' : '8'}" style="text-align:center;padding:20px;color:red;">Check your connection.</td></tr>`;
  }
}
