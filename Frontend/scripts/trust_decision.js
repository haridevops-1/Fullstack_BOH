import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is a logged-in trust
  if (checkAuth("trust") === false) {
    return;
  }

  // 2. Get the "id" from the URL (e.g., Trust_decision.html?id=12)
  const urlParameters = new URLSearchParams(window.location.search);
  const donationId = urlParameters.get("id");

  if (donationId) {
    // Fetch and show the information for this donation
    getDonationInfo(donationId);
  } else {
    // If no ID is found, go back to the dashboard
    window.location.href = "Trust_dashboard.html";
  }
});

// This function fetches details about the donation from the server
async function getDonationInfo(id) {
  try {
    const response = await fetch(BACKEND_URL + "/api/donor/donations/" + id, {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const donationItem = await response.json();

      // Helper function to update text in the HTML elements
      const updateText = function (elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
          element.innerText = value;
        }
      };

      // Fill in the donation details on the page
      updateText("detDonor", donationItem.name || "Anonymous");
      updateText("detFood", donationItem.food_name);
      updateText("detQty", donationItem.approx_quantity);
      updateText("detPhone", donationItem.mobile_number);
      updateText("detAddress", donationItem.address);
      updateText("detCity", donationItem.city);
      updateText("detPincode", donationItem.pincode || "N/A");

      // Show the category badge (Veg/Non-Veg)
      const category = (donationItem.category || "veg").toLowerCase();
      const categoryElement = document.getElementById("detCategory");
      if (categoryElement) {
        categoryElement.innerHTML = '<span class="category-badge ' + category + '">' + category + '</span>';
      }

      // Set up the Accept and Reject buttons
      const acceptButton = document.getElementById("acceptBtn");
      if (acceptButton) {
        acceptButton.onclick = function () {
          updateDonationDecision(id, "accepted");
        };
      }

      const rejectButton = document.getElementById("rejectBtn");
      if (rejectButton) {
        rejectButton.onclick = function () {
          updateDonationDecision(id, "rejected");
        };
      }
    }
  } catch (error) {
    alert("Error loading details. Please try again.");
  }
}

// This function sends the Accept or Reject decision to the server
async function updateDonationDecision(id, selectedStatus) {
  let reason = null;

  // 1. If the status is rejected, ask for a reason
  if (selectedStatus === "rejected") {
    reason = prompt("Please enter the reason for rejection:");
    
    // If they cancel the prompt, stop here
    if (reason === null) return;
    
    // If they leave it blank, we suggest a default reason or keep it empty
    if (reason.trim() === "") {
        reason = "Not specified by trust";
    }
  }

  try {
    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
          status: selectedStatus,
          reject_reason: reason 
      }),
    });

    if (response.ok === true) {
      showToast("Success: Your decision has been saved.", "success");
      // Go back to the dashboard after a successful decision
      setTimeout(() => {
        window.location.href = "Trust_dashboard.html";
      }, 2000);
    } else {
      const errorData = await response.json();
      showToast("Failed to save decision: " + (errorData.detail || "Server error"), "error");
    }
  } catch (error) {
    showToast("Error: Could not connect to the server.", "error");
  }
}
