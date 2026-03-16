import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

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
    
    // Set up the image preview functionality
    setupImagePreview();
    
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

// This function shows a preview of the image once the user selects a file
function setupImagePreview() {
  const fileInput = document.getElementById("proofImage");
  const previewImage = document.getElementById("previewImg");

  if (!fileInput) return;

  fileInput.onchange = function () {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      previewImage.src = event.target.result;
      previewImage.style.display = "block"; // Show the image element
    };
    reader.readAsDataURL(file);
  };
}

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

  const fileInput = document.getElementById("proofImage");
  const selectedFile = fileInput.files[0];

  // If the user selected a proof image, we need to convert it to a string first
  if (selectedFile) {
    // We use a Promise to wait for the file to be read
    updateData.proof_image = await new Promise(function (resolve) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    });
  }

  try {
    // Send the PUT request to the server
    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (response.ok === true) {
      alert("Success: Donation status updated.");
      
      // If the donation is completed, go back to dashboard. Otherwise, stay on same page.
      if (selectedStatus === "completed") {
        window.location.href = "Trust_dashboard.html";
      } else {
        window.location.reload();
      }
    } else {
      const errorData = await response.json();
      alert("Failed to update status: " + (errorData.detail || "Server error"));
    }
  } catch (error) {
    alert("Error: Could not connect to the server.");
  }
}
