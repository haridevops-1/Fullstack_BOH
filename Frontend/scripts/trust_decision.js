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
      
      // Formatting the time for display
      if (donationItem.scheduled_time) {
        const d = new Date(donationItem.scheduled_time);
        updateText("detTime", d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) + " (1-hour window)");
      } else {
        updateText("detTime", "Not specified");
      }

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
          const rejectionSection = document.getElementById("rejectionSection");
          const reasonBox = document.getElementById("rejectReason");
          
          if (rejectionSection.style.display === "none") {
            // First click: show the reason box
            rejectionSection.style.display = "block";
            showToast("Please provide a reason for rejection.", "warning");
          } else {
            // Second click: check if reason is filled and send
            const reason = reasonBox.value.trim();
            if (reason === "") {
              showToast("Error: You must write a reason to reject.", "error");
              return;
            }
            updateDonationDecision(id, "rejected", reason);
          }
        };
      }
    }
  } catch (error) {
    alert("Error loading details. Please try again.");
  }
}

// This function sends the Accept or Reject decision to the server
async function updateDonationDecision(id, selectedStatus, reason = null) {
  const acceptBtn = document.getElementById("acceptBtn");
  const rejectBtn = document.getElementById("rejectBtn");

  // Determine which button was clicked (or just disable both)
  if (selectedStatus === "accepted" && acceptBtn) {
    acceptBtn.classList.add("btn-loading");
  } else if (selectedStatus === "rejected" && rejectBtn) {
    rejectBtn.classList.add("btn-loading");
  }

  if (acceptBtn) acceptBtn.disabled = true;
  if (rejectBtn) rejectBtn.disabled = true;

  try {
    const payload = { status: selectedStatus };
    if (reason) payload.reject_reason = reason;

    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
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
      if (acceptBtn) { acceptBtn.classList.remove("btn-loading"); acceptBtn.disabled = false; }
      if (rejectBtn) { rejectBtn.classList.remove("btn-loading"); rejectBtn.disabled = false; }
    }
  } catch (error) {
    showToast("Error: Could not connect to the server.", "error");
    if (acceptBtn) { acceptBtn.classList.remove("btn-loading"); acceptBtn.disabled = false; }
    if (rejectBtn) { rejectBtn.classList.remove("btn-loading"); rejectBtn.disabled = false; }
  }
}
""