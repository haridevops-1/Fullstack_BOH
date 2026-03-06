// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchRejectedRequests();
});

/* -----------------------------
   Load rejected donation requests
----------------------------- */

async function fetchRejectedRequests() {
  var trustId = localStorage.getItem("userId");

  var container = document.querySelector(".container");

  if (!container) return;

  // Loading message
  container.innerHTML =
    '<p style="text-align:center;padding:20px;">Loading your rejection history...</p>';

  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/rejected_details?trust_id=" + trustId,
    );

    var rejectedList = await response.json();

    container.innerHTML = "";

    if (response.ok && rejectedList.length > 0) {
      for (var i = 0; i < rejectedList.length; i++) {
        var item = rejectedList[i];

        var card = document.createElement("div");

        card.className = "card";

        card.innerHTML =
          "<h3>" +
          item.food_name +
          "</h3>" +
          "<p><strong>Quantity:</strong> " +
          item.approx_quantity +
          "</p>" +
          "<p><strong>Donor Name:</strong> " +
          (item.name || "Anonymous donor") +
          "</p>" +
          "<p><strong>Location:</strong> " +
          item.city +
          "</p>" +
          '<div style="margin:15px 0;">' +
          '<span class="status rejected" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:4px 12px;border-radius:20px;font-weight:700;">' +
          item.status +
          "</span>" +
          "</div>";

        container.appendChild(card);
      }
    } else {
      container.innerHTML =
        '<p style="text-align:center;color:#666;margin-top:50px;">You haven\'t rejected any requests yet.</p>';
    }
  } catch (error) {
    console.log("Error:", error);

    container.innerHTML =
      '<p style="text-align:center;color:red;">Error: Could not load data. Check server.</p>';
  }
}
