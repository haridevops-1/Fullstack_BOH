// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchAcceptedRequests();
});

/* -----------------------------
   Load accepted donation requests
----------------------------- */

async function fetchAcceptedRequests() {
  var trustId = localStorage.getItem("userId");

  var tableBody = document.getElementById("acceptedTableBody");

  if (!tableBody) return;

  // Loading message
  tableBody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;padding:30px;">Loading your accepted requests...</td></tr>';

  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/accepted_details?trust_id=" + trustId,
    );

    var acceptedList = await response.json();

    tableBody.innerHTML = "";

    if (response.ok && acceptedList.length > 0) {
      for (var i = 0; i < acceptedList.length; i++) {
        var item = acceptedList[i];

        var row = document.createElement("tr");

        row.innerHTML =
          "<td>" +
          (item.name || "Anonymous donor") +
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
          '<button class="update-tracking-btn">Update</button>' +
          "</td>";

        tableBody.appendChild(row);

        // Update button click
        (function (donationId) {
          var btn = row.querySelector(".update-tracking-btn");

          if (btn) {
            btn.onclick = function () {
              window.location.href = "Trust_update.html?id=" + donationId;
            };
          }
        })(item.id);
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:#666;padding:50px;">You haven\'t accepted any requests yet.</td></tr>';
    }
  } catch (error) {
    console.log("Error:", error);

    tableBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;color:red;padding:30px;">Error: Could not load data. Check server.</td></tr>';
  }
}
