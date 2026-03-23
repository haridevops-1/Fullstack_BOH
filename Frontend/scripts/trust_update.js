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

// Function to enable/disable and SHOW/HIDE buttons based on current status
function updateButtonStates(currentStatus) {
  const reachedBtn = document.getElementById("reachedBtn");
  const pickedBtn = document.getElementById("pickedBtn");
  const completedBtn = document.getElementById("completedBtn");
  const imageProofSection = document.getElementById("imageProofSection");

  if (!reachedBtn || !pickedBtn || !completedBtn) return;

  // Initially hide all except reached
  reachedBtn.style.display = "none";
  pickedBtn.style.display = "none";
  completedBtn.style.display = "none";

  // Flow: Accepted -> Reached -> Picked -> Completed
  if (currentStatus === "accepted") {
    reachedBtn.style.display = "block";
    reachedBtn.disabled = false;
  } else if (currentStatus === "reached") {
    pickedBtn.style.display = "block";
    pickedBtn.disabled = false;
  } else if (currentStatus === "picked") {
    completedBtn.style.display = "block";
    completedBtn.disabled = false;
  } else if (currentStatus === "completed") {
    // If already completed, show the proof section or a message
    if (imageProofSection) {
        imageProofSection.style.display = "block";
        // Optionally disable the final button if it was already used
        const submitProofBtn = document.getElementById("submitProofBtn");
        if (submitProofBtn) submitProofBtn.disabled = true;
    }
  }
}

// This function sends the updated status to the server
async function handleStatusUpdate(id, selectedStatus, buttonElement) {
  // SPECIAL CASE: Clicking "Completed" doesn't hit server yet, it shows the photo section
  if (selectedStatus === "completed") {
    const section = document.getElementById("imageProofSection");
    if (section) {
      section.style.display = "block";
      section.scrollIntoView({ behavior: 'smooth' });
    }
    // Hide the button after clicking to focus on the photo
    buttonElement.style.display = "none";
    return;
  }

  const updateData = {
    status: selectedStatus
  };

  // Add loading state to button
  if (buttonElement) {
    buttonElement.classList.add("btn-loading");
    buttonElement.disabled = true;
  }

  try {
    const response = await fetch(BACKEND_URL + "/api/trust/donations/" + id + "/status", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (response.ok === true) {
      showToast("Success: Status updated to " + selectedStatus, "success");
      
      // Update UI after a short delay
      setTimeout(() => {
        buttonElement.classList.remove("btn-loading");
        updateButtonStates(selectedStatus);
      }, 1000);
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

// --- PHOTO PROOF LOGIC ---

// Handle Photo Selection & Preview
const photoInput = document.getElementById("completionPhoto");
if (photoInput) {
  photoInput.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const previewImg = document.getElementById("photoPreview");
        if (previewImg) {
          previewImg.src = event.target.result;
          previewImg.style.display = "block";
        }
        const uploadText = document.getElementById("uploadText");
        if (uploadText) uploadText.innerText = "✅ Photo Selected: " + file.name;
      };
      reader.readAsDataURL(file);
    }
  };
}

// Handle Final Submission (Finalize Donation)
const submitProofBtn = document.getElementById("submitProofBtn");
if (submitProofBtn) {
  submitProofBtn.onclick = async function () {
    const urlParameters = new URLSearchParams(window.location.search);
    const donationId = urlParameters.get("id");
    
    // Check if photo is picked
    const fileInput = document.getElementById("completionPhoto");
    if (!fileInput.files[0]) {
      showToast("Please upload a photo of the delivery.", "warning");
      return;
    }

    submitProofBtn.classList.add("btn-loading");
    submitProofBtn.disabled = true;

    // Convert image to Base64 (simple way for this project)
    const reader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);
    reader.onload = async function() {
      const base64Image = reader.result;
      
      const payload = {
        status: "completed",
        proof_image: base64Image 
      };

      try {
        const response = await fetch(BACKEND_URL + "/api/trust/donations/" + donationId + "/status", {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          showToast("Success! Donation marked as completed.", "success");
          setTimeout(() => {
            window.location.href = "Trust_dashboard.html";
          }, 2000);
        } else {
          showToast("Error finalizing donation.", "error");
          submitProofBtn.classList.remove("btn-loading");
          submitProofBtn.disabled = false;
        }
      } catch (err) {
        showToast("Server error. Try again.", "error");
        submitProofBtn.classList.remove("btn-loading");
        submitProofBtn.disabled = false;
      }
    };
  };
}
