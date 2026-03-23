import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This function runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is a logged-in trust
  if (checkAuth("trust") === false) {
    return;
  }

  // 2. Get the donation ID from the URL (e.g., Trust_update.html?id=123)
  const urlParameters = new URLSearchParams(window.location.search);
  const donationId = urlParameters.get("id");

  if (donationId) {
    // Fetch the details for this donation
    fetchDonationDetails(donationId);
    
    // Set up the "Update Status" button
    const updateButton = document.getElementById("updateStatusBtn");
    if (updateButton) {
      updateButton.onclick = function () {
        handleStatusUpdate(donationId);
      };
    }
  } else {
    // If no ID is found, send the user back to the dashboard
    window.location.href = "Trust_dashboard.html";
  }
});


// This function fetches donation details and puts them in the HTML
async function fetchDonationDetails(id) {
  try {
    const response = await fetch(BACKEND_URL + "/api/donor/donations/" + id, {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const donationItem = await response.json();

      // Helper function to set text in elements
      const setText = function (elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
          element.innerText = value;
        }
      };

      setText("updateFood", donationItem.food_name);
      setText("updateQty", donationItem.approx_quantity);
      setText("updateDonor", donationItem.name);
      setText("updatePhone", donationItem.mobile_number);
      setText("updateAddress", donationItem.address + ", " + donationItem.city);

      // Set the select box to the current status
      const statusSelect = document.getElementById("statusSelect");
      if (statusSelect) {
        statusSelect.value = donationItem.status.toLowerCase();
      }
    }
  } catch (error) {
    alert("Error loading details. Please refresh and try again.");
  }
}

// This function sends the updated status and proof image to the server
async function handleStatusUpdate(id) {
  const statusSelect = document.getElementById("statusSelect");
  const selectedStatus = statusSelect.value;
  
  const updateData = {
    status: selectedStatus
  };


  try {
    // Send the PUT request to the server
    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (response.ok === true) {
      showToast("Success: Donation status updated.", "success");
      
      // If the donation is completed, go back to dashboard. Otherwise, stay on same page.
      setTimeout(() => {
        if (selectedStatus === "completed") {
          window.location.href = "Trust_dashboard.html";
        } else {
          window.location.reload();
        }
      }, 2000);
    } else {
      const errorData = await response.json();
      showToast("Failed to update status: " + (errorData.detail || "Server error"), "error");
    }
  } catch (error) {
    showToast("Error: Could not connect to the server.", "error");
  }
}
