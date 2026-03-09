// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get trust name from URL
  var params = new URLSearchParams(window.location.search);
  var trustName = params.get("trustName");

  // Show trust name in heading
  if (trustName) {
    var heading = document.querySelector(".head h1");

    if (heading) {
      heading.innerText = "Donating to " + trustName;
    }
  }

  // Setup form submit
  setupFormSubmission();
});

/* -------------------------
   Setup form submit
------------------------- */
function setupFormSubmission() {
  var form = document.querySelector("form");

  if (form) {
    form.onsubmit = handleDonationSubmit;
  }
}

/* -------------------------
   Handle form submit
------------------------- */
async function handleDonationSubmit(event) {
  event.preventDefault();

  // Get trustId from URL
  var params = new URLSearchParams(window.location.search);
  var trustId = params.get("trustId");

  // Get donorId from localStorage
  var donorId = localStorage.getItem("userId");

  // Check trust selected
  if (!trustId) {
    alert("Please go back and select a trust organization first!");
    return;
  }

  // Check login
  if (!donorId) {
    alert("Your login has expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  // Collect form data
  var donationData = {
    name: document.getElementById("contactName").value,
    mobile_number: document.getElementById("mobileNumber").value,
    food_name: document.getElementById("foodName").value,
    category: document.getElementById("category").value,
    approx_quantity: document.getElementById("quantity").value,
    address: document.getElementById("address").value,
    area_landmark: document.getElementById("landmark").value,
    city: document.getElementById("city").value,
    pincode: document.getElementById("pincode").value,
    notes: document.getElementById("notes").value,
  };

  try {
    // Send donation request
    var response = await fetch(
      BACKEND_URL +
        "/api/donor/new_donation?trust_id=" +
        trustId +
        "&donor_id=" +
        donorId,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      },
    );

    // Success
    if (response.ok) {
      alert("Great! Your donation request has been sent.");

      window.location.href = "Donor_dashboard.html";
    } else {
      // Error from server
      var errorData = await response.json();

      alert("Sorry, request failed: " + (errorData.detail || "Unknown error"));
    }
  } catch (error) {
    alert("Connection error. Is the server running?");

    console.log("Error:", error);
  }
}
