import { BACKEND_URL, getAuthHeaders, formatDate } from "./api.js";

// This function runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  loadDonationHistory();
});

// This function fetches all donations and shows them in the table
async function loadDonationHistory() {
  const donorId = localStorage.getItem("userId");
  const tableBody = document.querySelector("tbody");
  const pageTitle = document.getElementById("pageTitle");

  // 1. Get the 'status' from the URL (e.g., mydonations.html?status=pending)
  const urlParameters = new URLSearchParams(window.location.search);
  const filterStatus = urlParameters.get("status");

  // 2. Update the page title based on the filter
  if (!filterStatus) {
    pageTitle.innerText = "All My Donations";
  } else {
    // Capitalize the first letter (e.g., 'pending' -> 'Pending')
    const capitalizedTitle = filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);
    pageTitle.innerText = capitalizedTitle + " Donations";
  }

  // 3. Special handling for the Rejected page (we hide the 'Track' column)
  let isRejectedPage = false;
  if (filterStatus && filterStatus.toLowerCase() === "rejected") {
    isRejectedPage = true;
  }

  if (isRejectedPage === true) {
    // 1. Hide the Action (Track) column header
    const actionHeader = document.querySelector("th:nth-child(8)");
    if (actionHeader) {
      actionHeader.style.display = "none";
    }

    // 2. Insert the 'Reason' column header before Status or Date
    // Actually, let's just add it at the end (before Action, which is now hidden)
    const tableHeadRow = document.querySelector("thead tr");
    if (tableHeadRow) {
      const reasonTh = document.createElement("th");
      reasonTh.innerText = "Reject Reason";
      // We insert it before the last column (Track)
      tableHeadRow.insertBefore(reasonTh, tableHeadRow.cells[7]);
    }
  }

  // Show a "Searching" message while we wait for the server
  let columnCount = 8;
  tableBody.innerHTML = '<tr><td colspan="' + columnCount + '" style="text-align:center;padding:20px;">Searching for records...</td></tr>';

  try {
    // Fetch all donations for this donor
    const response = await fetch(
      BACKEND_URL + "/api/donor/donations?donor_id=" + donorId,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.ok === true) {
      const allDonations = await response.json();
      
      // Clear the loading message
      tableBody.innerHTML = "";
      let visibleDonationsCount = 0;

      // Loop through each donation and decide if we should show it
      for (let i = 0; i < allDonations.length; i++) {
        const item = allDonations[i];
        const status = item.status.toLowerCase();
        
        let shouldShowItem = false;

        // Filtering logic
        if (!filterStatus) {
          // If no filter is set, show everything
          shouldShowItem = true;
        } else if (filterStatus === "accepted") {
          // 'Accepted' filter also shows 'reached' and 'picked' statuses
          if (status === "accepted" || status === "reached" || status === "picked") {
            shouldShowItem = true;
          }
        } else if (status === filterStatus.toLowerCase()) {
          // Otherwise, only show if the status matches exactly
          shouldShowItem = true;
        }

        if (shouldShowItem === true) {
          const row = document.createElement("tr");
          row.className = "donation-row";

          // Format the date using the helper from api.js
          const formattedDate = formatDate(item.created_at);

          // Decide the CSS class for the category badge
          let categoryClass = "veg";
          if (item.category === "non-veg") {
            categoryClass = "non-veg";
          } else if (item.category === "both") {
            categoryClass = "both";
          }

          // 5. Build the row HTML
          let rowHTML = 
            '<td>' + (item.trust_name || "Anonymous Trust") + '</td>' +
            '<td>' + item.food_name + '</td>' +
            '<td><span class="category-badge ' + categoryClass + '">' + (item.category || "veg") + '</span></td>' +
            '<td>' + item.approx_quantity + '</td>' +
            '<td>' + item.address + ', ' + item.city + '</td>' +
            '<td><span class="status ' + status + '">' + item.status + '</span></td>' +
            '<td>' + formattedDate + '</td>';
            
          // If it's the rejected page, we insert the "Reason" cell before the hidden Track button
          if (isRejectedPage === true) {
              rowHTML += '<td style="color:#ef4444; font-weight:600;">' + (item.reject_reason || "No reason specified") + '</td>';
          }
            
          // Add the "Track" button only if it's not the rejected page
          if (isRejectedPage === false) {
            rowHTML += '<td><button class="track-btn">Track</button></td>';
          }

          row.innerHTML = rowHTML;

          // Set up the click event for the Track button
          const trackButton = row.querySelector(".track-btn");
          if (trackButton) {
            trackButton.onclick = function () {
              window.location.href = "Donation-tracking.html?id=" + item.id;
            };
          }

          tableBody.appendChild(row);
          visibleDonationsCount++;
        }
      }

      // If no donations match the filter
      if (visibleDonationsCount === 0) {
        tableBody.innerHTML = '<tr><td colspan="' + columnCount + '" style="text-align:center;padding:40px;color:#94a3b8;">No matching donations found.</td></tr>';
      }
    } else {
      tableBody.innerHTML = '<tr><td colspan="' + columnCount + '" style="text-align:center;padding:20px;color:red;">Could not load your records.</td></tr>';
    }
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="' + columnCount + '" style="text-align:center;padding:20px;color:red;">Check your connection.</td></tr>';
  }
}
