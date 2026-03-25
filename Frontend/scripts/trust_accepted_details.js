import { BACKEND_URL, getAuthHeaders, checkAuth, formatDate } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is a logged-in trust
  if (checkAuth("trust") === true) {
    fetchAcceptedDonations();
  }
});

// This function fetches all the donations that this trust has "Accepted"
async function fetchAcceptedDonations() {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.getElementById("acceptedTableBody");

  if (!tableBody) {
    return;
  }

  // Show a loading message
  tableBody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;">Loading records...</td></tr>';

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/accepted_details?trust_id=" + trustId,
      { headers: getAuthHeaders() },
    );

    if (response.ok === true) {
      const acceptedList = await response.json();

      // Clear the loading message
      tableBody.innerHTML = "";

      // If the list is empty, show a message
      if (acceptedList.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;">No accepted requests found.</td></tr>';
      } else {
        // Loop through each accepted donation and add a row to the table
        for (let i = 0; i < acceptedList.length; i++) {
          const item = acceptedList[i];
          const row = document.createElement("tr");

          // Build the row HTML string
          // We use formatDate(item.created_at) which is imported from api.js
          const rowHTML =
            "<td>" +
            (item.name || "Anonymous") +
            "</td>" +
            "<td>" +
            item.food_name +
            "</td>" +
            "<td>" +
            item.approx_quantity +
            "</td>" +
            '<td><span class="status ' +
            item.status.toLowerCase() +
            '">' +
            item.status +
            "</span></td>" +
            "<td>" +
            formatDate(item.created_at) +
            "</td>" +
            '<td><button class="update-tracking-btn" onclick="window.location.href=\'Trust_update.html?id=' +
            item.id +
            "'\">Update</button></td>";

          row.innerHTML = rowHTML;
          tableBody.appendChild(row);
        }
      }
    }
  } catch (error) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:red;">Error loading records. Please refresh.</td></tr>';
  }
}
