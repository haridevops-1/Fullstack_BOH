import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is a logged-in trust
  if (checkAuth("trust") === true) {
    fetchRejectedRequests();
  }
});

// This function fetches all the donations that this trust has "Rejected"
async function fetchRejectedRequests() {
  const trustId = localStorage.getItem("userId");
  const container = document.querySelector(".container");
  
  if (!container) {
    return;
  }

  // Show a loading message
  container.innerHTML = '<p style="text-align:center;padding:20px;">Loading rejection history...</p>';

  try {
    const response = await fetch(
      BACKEND_URL + "/api/trust/rejected_details?trust_id=" + trustId,
      { headers: getAuthHeaders() }
    );

    if (response.ok === true) {
      const rejectedList = await response.json();
      
      // Clear the loading message
      container.innerHTML = "";

      // If the list is empty, show a message
      if (rejectedList.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;margin-top:50px;">No rejected requests found.</p>';
      } else {
        // Loop through each rejected donation and create a card
        for (let i = 0; i < rejectedList.length; i++) {
          const item = rejectedList[i];
          const card = document.createElement("div");
          card.className = "card";

          // Build the card HTML string
          card.innerHTML = 
            '<h3>' + item.food_name + '</h3>' +
            '<p><strong>Quantity:</strong> ' + item.approx_quantity + '</p>' +
            '<p><strong>Donor Name:</strong> ' + (item.name || "Anonymous") + '</p>' +
            '<p><strong>Location:</strong> ' + item.city + '</p>' +
            '<div style="margin:15px 0;">' +
                '<span class="status rejected" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:4px 12px;border-radius:20px;font-weight:700;">' +
                    item.status +
                '</span>' +
            '</div>';

          container.appendChild(card);
        }
      }
    }
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:red;">Error loading records. Please try again.</p>';
  }
}
