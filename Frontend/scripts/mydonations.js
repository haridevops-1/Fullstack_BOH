// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadDonationHistory();
});

/* -------------------------
   Load donation history
------------------------- */

async function loadDonationHistory() {
  var donorId = localStorage.getItem("userId");

  var tableBody = document.querySelector("tbody");

  var pageTitle = document.getElementById("pageTitle");

  // Get filter from URL
  var params = new URLSearchParams(window.location.search);

  var filterStatus = params.get("status");

  /* -------------------------
       Update page title
    ------------------------- */

  if (!filterStatus) {
    pageTitle.innerText = "All My Donations";
  } else {
    var title = filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);

    pageTitle.innerText = title + " Donations";
  }

  var isRejectedPage = (filterStatus && filterStatus.toLowerCase() === "rejected");

  if (isRejectedPage) {
    // Hide the "Action" column header (now the 8th column)
    var actionHeader = document.querySelector("th:nth-child(8)");
    if (actionHeader) actionHeader.style.display = "none";
  }

  tableBody.innerHTML =
    '<tr><td colspan="' + (isRejectedPage ? "7" : "8") + '" style="text-align:center;padding:20px;">Searching for records...</td></tr>';

  try {
    console.log("Fetching donations for donor:", donorId);

    var response = await fetch(
      BACKEND_URL + "/api/donor/donations?donor_id=" + donorId,
    );

    if (response.ok) {
      var donations = await response.json();

      tableBody.innerHTML = "";
      var count = 0;

      for (var i = 0; i < donations.length; i++) {
        var item = donations[i];
        var status = item.status.toLowerCase();
        var show = false;

        // Filter logic
        if (!filterStatus) {
          show = true;
        } else if (filterStatus === "accepted") {
          if (status === "accepted" || status === "reached" || status === "picked") {
            show = true;
          }
        } else if (status === filterStatus.toLowerCase()) {
          show = true;
        }

        if (show) {
          var row = document.createElement("tr");
          row.className = "donation-row";

          // Simple date check to avoid showing 01/01/1970
          var dateString = "Date Unknown";
          if (item.created_at) {
            var donationDate = new Date(item.created_at);
            // Check if date is actually valid
            if (!isNaN(donationDate.getTime())) {
              dateString = donationDate.toLocaleDateString();
            }
          }

          var actionCell = isRejectedPage ? "" : '<td><button class="track-btn">Track</button></td>';

          // Food category badge logic
          var catClass = "veg";
          if (item.category === "non-veg") catClass = "non-veg";
          else if (item.category === "both") catClass = "both";

          row.innerHTML =
            "<td>" + (item.trust_name || "Anonymous Trust") + "</td>" +
            "<td>" + item.food_name + "</td>" +
            '<td><span class="category-badge ' + catClass + '">' + (item.category || "veg") + "</span></td>" +
            "<td>" + item.approx_quantity + "</td>" +
            "<td>" + item.address + ", " + item.city + "</td>" +
            '<td><span class="status ' + status + '">' + item.status + "</span></td>" +
            "<td>" + dateString + "</td>" +
            actionCell;

          // Only the Track button should be clickable for details
          var trackBtn = row.querySelector(".track-btn");
          if (trackBtn) {
            (function (id) {
              trackBtn.onclick = function () {
                window.location.href = "Donation-tracking.html?id=" + id;
              };
            })(item.id);
          }

          tableBody.appendChild(row);
          count++;
        }
      }

      if (count === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="' + (isRejectedPage ? "7" : "8") + '" style="text-align:center;padding:40px;color:#94a3b8;">No matching donations found.</td></tr>';
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="' + (isRejectedPage ? "7" : "8") + '" style="text-align:center;padding:20px;color:red;">Could not load your records.</td></tr>';
    }
  } catch (error) {
    tableBody.innerHTML =
      '<tr><td colspan="' + (isRejectedPage ? "7" : "8") + '" style="text-align:center;padding:20px;color:red;">Check your connection.</td></tr>';
  }
}
