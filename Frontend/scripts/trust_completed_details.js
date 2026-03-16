import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is a logged-in trust
  if (checkAuth("trust") === true) {
    fetchCompletedDonations();
  }
});

// This function fetches all donations that have a status of "Completed" for this trust
async function fetchCompletedDonations() {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.getElementById("completedTableBody");
  
  if (!tableBody) {
    return;
  }

  // Show a "Looking" message while we wait for the server
  tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Looking for completed works...</td></tr>';

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
      { headers: getAuthHeaders() }
    );

    if (response.ok === true) {
      const allDonations = await response.json();
      
      // We only want to show donations that are "Completed"
      const completedList = [];
      for (let i = 0; i < allDonations.length; i++) {
          if (allDonations[i].status.toLowerCase() === "completed") {
              completedList.push(allDonations[i]);
          }
      }

      // Clear the table before adding rows
      tableBody.innerHTML = "";

      // If no completed donations exist, show a message
      if (completedList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No completed donations yet.</td></tr>';
      } else {
        // Loop through each completed donation and create a row
        for (let i = 0; i < completedList.length; i++) {
          const item = completedList[i];
          const row = document.createElement("tr");

          const category = (item.category || "veg").toLowerCase();

          // Build the row HTML string
          row.innerHTML = 
            '<td>' + (item.name || "Anonymous") + '</td>' +
            '<td>' + item.food_name + '</td>' +
            '<td><span class="category-badge ' + category + '">' + category + '</span></td>' +
            '<td>' + item.approx_quantity + '</td>' +
            '<td>' + (item.address || "N/A") + '</td>' +
            '<td>' + item.city + '</td>' +
            '<td><span class="status completed">' + item.status + '</span></td>';

          tableBody.appendChild(row);
        }
      }
    }
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Error loading records. Please try again.</td></tr>';
  }
}
