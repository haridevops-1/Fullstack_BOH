import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is a logged-in trust
  if (checkAuth("trust") === true) {
    fetchIncomingRequests();
  }
});


// This function fetches only the NEW (pending) requests from the server
async function fetchIncomingRequests() {
  const trustId = localStorage.getItem("userId");
  const container = document.querySelector(".container");
  
  // If the container element isn't found, stop here
  if (!container) {
    return;
  }

  // Show a message while we wait for the data
  container.innerHTML = '<p style="text-align:center;padding:20px;">Fetching new requests...</p>';

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId,
      { headers: getAuthHeaders() }
    );

    if (response.ok === true) {
      const allDonations = await response.json();
      
      // We only want to show "Pending" donations in this view
      const pendingDonations = [];
      for (let i = 0; i < allDonations.length; i++) {
          if (allDonations[i].status.toLowerCase() === "pending") {
              pendingDonations.push(allDonations[i]);
          }
      }

      // Clear the container
      container.innerHTML = "";

      // If there are no pending requests, show a nice empty message
      if (pendingDonations.length === 0) {
        container.innerHTML = 
            '<div style="text-align:center;padding:80px;background:white;border-radius:12px;border:1px solid #eaecf0;">' +
            '<p style="color:#64748b;font-size:18px;font-weight:500;">No new incoming requests.</p>' +
            '</div>';
      } else {
        // If there are pending requests, create a card for each one
        for (let i = 0; i < pendingDonations.length; i++) {
          const item = pendingDonations[i];
          const card = document.createElement("div");
          card.className = "card pending-card-row";
          
          const category = (item.category || "veg").toLowerCase();

          // Build the card HTML
          card.innerHTML = 
            '<div class="card-header-top"><h4>Food: ' + item.food_name + '</h4></div>' +
            '<div class="card-body-details">' +
                '<div class="detail-row"><strong>Quantity:</strong> ' + item.approx_quantity + '</div>' +
                '<div class="detail-row"><strong>Type:</strong> <span class="category-badge ' + category + '">' + category + '</span></div>' +
                '<div class="detail-row"><strong>Donor:</strong> ' + (item.name || "Anonymous") + '</div>' +
                '<div class="detail-row"><strong>City:</strong> ' + item.city + '</div>' +
            '</div>' +
            '<div class="card-footer-action">' +
                '<button class="decide-btn" onclick="window.location.href=\'Trust_decision.html?id=' + item.id + '\'">View & Decide</button>' +
            '</div>';
            
          container.appendChild(card);
        }
      }
    }
  } catch (error) {
    container.innerHTML = '<p style="color:red;text-align:center;">Error loading requests. Please try again.</p>';
  }
}
