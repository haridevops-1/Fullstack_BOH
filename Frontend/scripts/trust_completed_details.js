// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchCompletedArchive();
});

/* -----------------------------
   Load completed donation history
----------------------------- */

async function fetchCompletedArchive() {
  var trustId = localStorage.getItem("userId");

  var tableBody = document.getElementById("completedTableBody");

  if (!tableBody) return;

  // Show loading message
  tableBody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;padding:40px;">Finding your completed works...</td></tr>';

  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
    );

    var donations = await response.json();

    tableBody.innerHTML = "";

    var completedCount = 0;

    if (response.ok) {
      for (var i = 0; i < donations.length; i++) {
        var item = donations[i];

        if (item.status.toLowerCase() === "completed") {
          var row = document.createElement("tr");

          var cat = (item.category || "veg").toLowerCase();
          var categoryBadge = '<span class="category-badge ' + cat + '">' + cat + '</span>';

          row.innerHTML =
            "<td>" + (item.name || "Anonymous donor") + "</td>" +
            "<td>" + item.food_name + "</td>" +
            "<td>" + categoryBadge + "</td>" +
            "<td>" + item.approx_quantity + "</td>" +
            "<td>" + (item.address || "N/A") + "</td>" +
            "<td>" + item.city + "</td>" +
            "<td>" + '<span class="status completed">' + item.status + "</span>" + "</td>";

          tableBody.appendChild(row);

          completedCount++;
        }
      }
    }

    // Show message if no completed donations
    if (completedCount === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:60px;color:#94a3b8;font-style:italic;">No completed donations found yet.</td></tr>';
    }
  } catch (error) {
    console.log("Error:", error);

    tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;color:red;">Error: Could not load the archive.</td></tr>';
  }
}
