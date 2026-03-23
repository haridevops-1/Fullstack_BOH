import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This function runs when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is a logged-in trust
  if (checkAuth("trust") === false) {
    return;
  }

  // 2. Get the donation ID from the URL
  const urlParameters = new URLSearchParams(window.location.search);
  const donationId = urlParameters.get("id");

  if (donationId) {
    // Fetch the details for this donation
    fetchDonationDetails(donationId);
    
    // Set up status button click handlers
    const reachedBtn = document.getElementById("reachedBtn");
    const pickedBtn = document.getElementById("pickedBtn");
    const completedBtn = document.getElementById("completedBtn");

    if (reachedBtn) {
      reachedBtn.onclick = () => handleStatusUpdate(donationId, "reached", reachedBtn);
    }
    if (pickedBtn) {
      pickedBtn.onclick = () => handleStatusUpdate(donationId, "picked", pickedBtn);
    }
    if (completedBtn) {
      completedBtn.onclick = () => handleStatusUpdate(donationId, "completed", completedBtn);
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

      // --- Enforce Sequential Status Logic ---
      updateButtonStates(donationItem.status.toLowerCase());
    }
  } catch (error) {
    console.error("Error loading details:", error);
    showToast("Error loading details. Please refresh and try again.", "error");
  }
}

// Function to enable/disable buttons based on current status
function updateButtonStates(currentStatus) {
  const reachedBtn = document.getElementById("reachedBtn");
  const pickedBtn = document.getElementById("pickedBtn");
  const completedBtn = document.getElementById("completedBtn");

  if (!reachedBtn || !pickedBtn || !completedBtn) return;

  // Reset all
  [reachedBtn, pickedBtn, completedBtn].forEach(btn => {
    btn.disabled = true;
    btn.classList.remove("active");
  });

  // Flow: Accepted -> Reached -> Picked -> Completed
  if (currentStatus === "accepted") {
    reachedBtn.disabled = false;
  } else if (currentStatus === "reached") {
    reachedBtn.classList.add("active");
    pickedBtn.disabled = false;
  } else if (currentStatus === "picked") {
    reachedBtn.classList.add("active");
    pickedBtn.classList.add("active");
    completedBtn.disabled = false;
  } else if (currentStatus === "completed") {
    reachedBtn.classList.add("active");
    pickedBtn.classList.add("active");
    completedBtn.classList.add("active");
  }
}

// This function sends the updated status to the server
async function handleStatusUpdate(id, selectedStatus, buttonElement) {
  const updateData = {
    status: selectedStatus
  };

  // Add loading state to button
  if (buttonElement) {
    buttonElement.classList.add("btn-loading");
    buttonElement.disabled = true;
  }

  try {
    // Send the PUT request to the server
    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (response.ok === true) {
      showToast("Success: Status updated to " + selectedStatus, "success");
      
      // Update UI after a short delay
      setTimeout(() => {
        if (selectedStatus === "completed") {
          window.location.href = "Trust_dashboard.html";
        } else {
          // Instead of reload, just update button states for a smoother feel
          buttonElement.classList.remove("btn-loading");
          updateButtonStates(selectedStatus);
          // Optional: window.location.reload(); 
        }
      }, 1500);
    } else {
      const errorData = await response.json();
      showToast("Failed to update status: " + (errorData.detail || "Server error"), "error");
      if (buttonElement) {
        buttonElement.classList.remove("btn-loading");
        buttonElement.disabled = false;
      }
    }
  } catch (error) {
    showToast("Error: Could not connect to the server.", "error");
    if (buttonElement) {
      buttonElement.classList.remove("btn-loading");
      buttonElement.disabled = false;
    }
  }
}
