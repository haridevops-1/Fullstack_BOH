// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchIncomingRequests();
});

/* -----------------------------
   Load pending donation requests
----------------------------- */

async function fetchIncomingRequests() {
  var trustId = localStorage.getItem("userId");

  var container = document.querySelector(".container");

  if (!container) return;

  // Show loading message
  container.innerHTML =
    '<p style="text-align:center;padding:20px;">Fetching new requests...</p>';

  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
    );

    var donations = await response.json();

    container.innerHTML = "";

    var found = 0;

    if (response.ok) {
      for (var i = 0; i < donations.length; i++) {
        var item = donations[i];

        if (item.status.toLowerCase() === "pending") {
          var card = document.createElement("div");

          card.className = "card pending-card-row";

          card.innerHTML =
            '<div class="card-header-top">' +
            '<h4>Food: ' + item.food_name + '</h4>' +
            '</div>' +
            '<div class="card-body-details">' +
            '<div class="detail-row"><strong>Quantity:</strong> ' + item.approx_quantity + '</div>' +
            '<div class="detail-row"><strong>Veg/Non-veg:</strong> <span class="category-badge ' + (item.category || "veg") + '">' + (item.category || "veg") + '</span></div>' +
            '<div class="detail-row"><strong>Donor:</strong> ' + (item.name || "Anonymous") + '</div>' +
            '<div class="detail-row"><strong>City:</strong> ' + item.city + '</div>' +
            "</div>" +
            '<div class="card-footer-action">' +
            '<button class="decide-btn" onclick="window.location.href=\'Trust_decision.html?id=' +
            item.id +
            "'\">View & Decide</button>" +
            "</div>";

          container.appendChild(card);

          found++;
        }
      }
    }

    // Show message if no requests
    if (found === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:80px;background:white;border-radius:12px;border:1px solid #eaecf0;">' +
        '<p style="color:#64748b;font-size:18px;font-weight:500;">No new incoming requests.</p>' +
        '<p style="color:#94a3b8;margin-top:10px;">Check back later!</p>' +
        "</div>";
    }
  } catch (error) {
    console.log("Error:", error);

    container.innerHTML =
      '<p style="color:red;text-align:center;">Error loading requests.</p>';
  }
}
