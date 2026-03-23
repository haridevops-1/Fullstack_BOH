import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This Set helps us keep track of which donations we have already seen.
// This is used to avoid showing multiple notifications for the same new donation.
let seenDonationIds = new Set();
let isFirstPageLoad = true;

// This function runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is logged in as a trust
  if (checkAuth("trust") === false) {
    return;
  }

  // 2. Show a welcome message with the trust name
  const userName = localStorage.getItem("userName");
  const welcomeHeading = document.getElementById("welcomeHeading");
  if (welcomeHeading) {
    if (userName && userName !== "undefined" && userName !== "null") {
      welcomeHeading.innerText = "Welcome, " + userName;
    } else {
      welcomeHeading.innerText = "Welcome, Trust Partner";
    }
  }

  // 3. Fetch stats and recent donations for the first time
  fetchTrustDashboardStats();
  loadRecentTrustDonations(true);

  // 4. Set up the manual Refresh button
  const refreshBtn = document.querySelector(".refresh-btn");
  if (refreshBtn) {
    refreshBtn.onclick = function () {
      refreshBtn.classList.add("btn-loading");
      fetchTrustDashboardStats();
      loadRecentTrustDonations(false);
      setTimeout(() => {
        refreshBtn.classList.remove("btn-loading");
      }, 800);
    };
  }

  // 5. Automatically check for updates every 10 seconds (Polling)
  setInterval(function () {
    fetchTrustDashboardStats();
    loadRecentTrustDonations(false);
  }, 10000);
});

// This function fetches counts for the status boxes (Pending, Accepted, etc.)
async function fetchTrustDashboardStats() {
  const trustId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.ok === true) {
      const donationList = await response.json();

      let pendingCount = 0;
      let acceptedCount = 0;
      let rejectedCount = 0;
      let completedCount = 0;

      // Loop through each donation to count statuses
      for (let i = 0; i < donationList.length; i++) {
        const item = donationList[i];
        const status = item.status.toLowerCase();

        if (status === "pending") {
          pendingCount++;
        } else if (status === "accepted" || status === "reached" || status === "picked") {
          acceptedCount++;
        } else if (status === "rejected") {
          rejectedCount++;
        } else if (status === "completed") {
          completedCount++;
        }
      }

      // Update the numbers on the dashboard
      const pendingDisp = document.querySelector(".pending");
      const acceptDisp = document.querySelector(".accept");
      const rejectDisp = document.querySelector(".reject");
      const completedDisp = document.querySelector(".completed-count");

      if (pendingDisp) pendingDisp.innerText = pendingCount;
      if (acceptDisp) acceptDisp.innerText = acceptedCount;
      if (rejectDisp) rejectDisp.innerText = rejectedCount;
      if (completedDisp) completedDisp.innerText = completedCount;

      // Hide the "no requests" message in the footer if there are pending items
      const footerMsg = document.querySelector(".card-footer-text");
      if (footerMsg) {
        if (pendingCount > 0) {
          footerMsg.style.display = "none";
        } else {
          footerMsg.style.display = "block";
        }
      }
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// This function loads the active donations into the table
async function loadRecentTrustDonations(isInitial) {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.querySelector("tbody");

  if (!tableBody) return;

  // Show loading message on the first load
  if (isInitial === true) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Looking for active requests...</td></tr>';
  }

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.ok === true) {
      const donations = await response.json();

      // Check for new incoming donations to show a toast notification
      for (let i = 0; i < donations.length; i++) {
        const item = donations[i];
        const id = item.id;
        const status = item.status.toLowerCase();

        // If this is a NEW pending donation we haven't seen before...
        if (status === "pending" && seenDonationIds.has(id) === false) {
          // Only show notification if the page has already finished its initial load
          if (isInitial === false && isFirstPageLoad === false) {
            showNotificationToast("New Incoming Donation: " + (item.food_name || "Food Request"));
          }
          seenDonationIds.add(id);
        } else if (seenDonationIds.has(id) === false) {
          seenDonationIds.add(id);
        }
      }

      // After checking for new items, mark initial load as finished
      isFirstPageLoad = false;

      // Clear the table and rebuild it
      tableBody.innerHTML = "";
      let countShown = 0;

      for (let i = 0; i < donations.length; i++) {
        const item = donations[i];
        const status = item.status.toLowerCase();

        // Only show active donations (not completed or rejected)
        if (status !== "completed" && status !== "rejected") {
          const row = document.createElement("tr");

          // When the row is clicked, decide which page to go to
          row.onclick = function () {
            if (status === "pending") {
              window.location.href = "Trust_decision.html?id=" + item.id;
            } else {
              window.location.href = "Trust_update.html?id=" + item.id;
            }
          };

          // Decide if we should show a "NEW" badge
          let badgeHTML = "";
          if (status === "pending") {
            badgeHTML = '<span class="new-badge">NEW</span>';
          }

          // Decide category badge CSS class
          let categoryClass = "veg";
          if (item.category === "non-veg") {
            categoryClass = "non-veg";
          } else if (item.category === "both") {
            categoryClass = "both";
          }

          // Build the row HTML
          row.innerHTML =
            '<td>' + (item.name || "Anonymous donor") + badgeHTML + '</td>' +
            '<td>' + item.food_name + '</td>' +
            '<td><span class="category-badge ' + categoryClass + '">' + (item.category || "veg") + '</span></td>' +
            '<td>' + item.approx_quantity + '</td>' +
            '<td>' + item.city + '</td>' +
            '<td><span class="status ' + status + '">' + item.status + '</span></td>';

          tableBody.appendChild(row);
          countShown++;
        }
      }

      // If there are no active donations
      if (countShown === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">No active donation requests found.</td></tr>';
      }
    }
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Connection error. Please try again.</td></tr>';
  }
}

// This function shows a small notification popup for new donations
function showNotificationToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast incoming";
  toast.innerHTML = '<span class="toast-icon">🛎️</span><span class="toast-message">' + message + '</span>';
  container.appendChild(toast);

  // Automatically hide after 5 seconds
  setTimeout(function () {
    toast.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(function () {
      toast.remove();
    }, 500);
  }, 5000);
}

