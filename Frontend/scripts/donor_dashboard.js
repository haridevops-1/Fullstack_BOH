import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This object helps us remember the status of donations from the last time we checked.
// It allows us to show a notification if the status changes.
let previousDonationStatuses = {};

// This function runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is logged in as a donor
  if (checkAuth("donor") === false) {
    return;
  }

  // 2. Show a welcome message with the user's name
  const userName = localStorage.getItem("userName");
  const welcomeHeading = document.getElementById("welcomeHeading");
  if (welcomeHeading) {
    if (userName && userName !== "undefined" && userName !== "null") {
      welcomeHeading.innerText = "Welcome, " + userName.trim();
    } else {
      welcomeHeading.innerText = "Welcome, Donor";
    }
  }

  // 3. Fetch the recent activity for the first time
  fetchDonorDashboardData(true);

  // 4. Check for updates every 10 seconds (Polling)
  setInterval(function () {
    fetchDonorDashboardData(false);
  }, 10000);
});

// This function fetches data from the server and updates the dashboard
async function fetchDonorDashboardData(isFirstLoad) {
  const donorId = localStorage.getItem("userId");
  const tableBody = document.querySelector(".donation-table tbody");

  // If we can't find the table, stop
  if (!tableBody) {
    return;
  }

  // If this is the first time loading, show a "Loading" message
  if (isFirstLoad === true) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading your dashboard...</td></tr>';
  }

  try {
    // Call the API to get donations for this donor
    const response = await fetch(
      BACKEND_URL + "/api/donor/donations?donor_id=" + donorId,
      {
        headers: getAuthHeaders(),
      },
    );

    if (response.ok === true) {
      const donations = await response.json();

      // Initialize counters for the status boxes
      let pendingCount = 0;
      let acceptedCount = 0;
      let rejectedCount = 0;
      let completedCount = 0;

      // Loop through each donation to count statuses and look for changes
      for (let i = 0; i < donations.length; i++) {
        const item = donations[i];
        const currentStatus = item.status.toLowerCase();

        // Count how many of each status we have
        if (currentStatus === "pending") {
          pendingCount++;
        } else if (
          currentStatus === "accepted" ||
          currentStatus === "reached" ||
          currentStatus === "picked"
        ) {
          acceptedCount++;
        } else if (currentStatus === "rejected") {
          rejectedCount++;
        } else if (currentStatus === "completed") {
          completedCount++;
        }

        // --- CHECK FOR STATUS CHANGES (to show notifications) ---
        // If this is NOT the first load, and we already know about this donation,
        // and the status has changed...
        if (isFirstLoad === false && previousDonationStatuses[item.id]) {
          if (previousDonationStatuses[item.id] !== currentStatus) {
            // Determine what message to show
            let notificationMessage = "";
            if (currentStatus === "accepted") {
              notificationMessage = "accepted your request!";
            } else if (currentStatus === "reached") {
              notificationMessage = "reached your location!";
            } else if (currentStatus === "picked") {
              notificationMessage = "picked up the food!";
            } else if (currentStatus === "completed") {
              notificationMessage = "completed the donation!";
            } else if (currentStatus === "rejected") {
              notificationMessage = "declined the request.";
            }

            if (notificationMessage !== "") {
              const trustName = item.trust_name || "A Trust";
              showToast(
                "Update: " + trustName + " has " + notificationMessage,
                currentStatus,
              );
            }
          }
        }

        // Remember the status for the next check
        previousDonationStatuses[item.id] = currentStatus;
      }

      // Update the numbers in the dashboard boxes
      const pendingDisp = document.querySelector(".pending-val");
      const acceptDisp = document.querySelector(".accept-val");
      const rejectDisp = document.querySelector(".reject-val");
      const totalDisp = document.querySelector(".total-val");

      if (pendingDisp) pendingDisp.innerText = pendingCount;
      if (acceptDisp) acceptDisp.innerText = acceptedCount;
      if (rejectDisp) rejectDisp.innerText = rejectedCount;
      if (totalDisp) totalDisp.innerText = completedCount;

      // Update the table with active (non-completed/non-rejected) donations
      updateDonationTable(donations);
    }
  } catch (error) {
    if (isFirstLoad === true) {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Connection error. Please try again.</td></tr>';
    }
  }
}

// This function updates the HTML table with the list of donations
function updateDonationTable(donations) {
  const tableBody = document.querySelector(".donation-table tbody");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear existing rows
  let countShown = 0;

  for (let i = 0; i < donations.length; i++) {
    const item = donations[i];
    const status = item.status.toLowerCase();

    // Only show active donations (not completed or rejected) and limit to 5 rows
    if (status !== "completed" && status !== "rejected" && countShown < 5) {
      const row = document.createElement("tr");
      row.style.cursor = "pointer";

      // When a row is clicked, go to the tracking page
      row.onclick = function () {
        window.location.href = "Donation-tracking.html?id=" + item.id;
      };

      // Decide which CSS class to use for the category badge
      let categoryClass = "veg";
      if (item.category === "non-veg") {
        categoryClass = "non-veg";
      } else if (item.category === "both") {
        categoryClass = "both";
      }

      // Build the HTML for the row
      row.innerHTML =
        '<td style="font-weight:600;">' +
        (item.trust_name || "Anonymous Trust") +
        "</td>" +
        '<td><span class="category-badge ' +
        categoryClass +
        '">' +
        (item.category || "veg") +
        "</span></td>" +
        "<td>" +
        item.food_name +
        "</td>" +
        '<td style="font-weight:500;">' +
        item.approx_quantity +
        "</td>" +
        "<td>" +
        item.city +
        "</td>" +
        '<td><span class="status ' +
        status +
        '">' +
        item.status +
        "</span></td>";

      tableBody.appendChild(row);
      countShown++;
    }
  }

  // If there are no active donations to show
  if (countShown === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">No active donations in progress.</td></tr>';
  }
}

// This function shows a small popup (notification) when a donation status changes
function showStatusNotification(message, status) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = "toast status-update " + status;

  // Decide which icon to show
  let icon = "🔔";
  if (status === "accepted") icon = "✅";
  else if (status === "reached") icon = "📍";
  else if (status === "picked") icon = "📦";
  else if (status === "completed") icon = "🎉";
  else if (status === "rejected") icon = "❌";

  notification.innerHTML =
    '<span class="toast-icon">' +
    icon +
    '</span><span class="toast-message">' +
    message +
    "</span>";
  container.appendChild(notification);

  // Automatically hide and remove the notification after 6 seconds
  setTimeout(function () {
    notification.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(function () {
      notification.remove();
    }, 500);
  }, 6000);
}

