import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This variable remembers the last status we saw, so we can detect changes
let lastDonationStatus = null;

// This function runs when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // 1. Check if the user is a donor
  if (checkAuth("donor") === false) {
    return;
  }

  // 2. Get the "id" of the donation from the URL (e.g., tracking.html?id=123)
  const urlParameters = new URLSearchParams(window.location.search);
  const donationId = urlParameters.get("id");

  if (donationId) {
    // Fetch the donation details for the first time
    fetchDonationDetails(donationId, true);

    // Check for status updates every 7 seconds (Polling)
    setInterval(function () {
      fetchDonationDetails(donationId, false);
    }, 7000);
  } else {
    // If no ID is found, go back to the dashboard
    window.location.href = "Donor_dashboard.html";
  }
});

// This function fetches the latest info about a specific donation from the server
async function fetchDonationDetails(id, isFirstLoad) {
  try {
    const response = await fetch(BACKEND_URL + "/api/donor/donations/" + id, {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const donationItem = await response.json();

      // Update the information shown on the page
      updateTrackingUI(donationItem);

      const currentStatus = donationItem.status.toLowerCase();

      // Show a notification if the status has changed since the last time we checked
      if (isFirstLoad === false && lastDonationStatus !== null) {
        if (lastDonationStatus !== currentStatus) {
          let changeMessage = "";
          if (currentStatus === "accepted") {
            changeMessage = "Trust accepted your donation!";
          } else if (currentStatus === "reached") {
            changeMessage = "Vehicle reached your location!";
          } else if (currentStatus === "picked") {
            changeMessage = "Food picked up successfully!";
          } else if (currentStatus === "completed") {
            changeMessage = "Donation process complete!";
          } else {
            changeMessage = "Status updated: " + donationItem.status;
          }

          showToast(changeMessage, currentStatus);
        }
      }

      // Remember the status for the next check
      lastDonationStatus = currentStatus;
    }
  } catch (error) {
    console.error("Error fetching donation details:", error);
  }
}

// This function updates all the text and labels on the tracking page
function updateTrackingUI(item) {
  // 1. Update the visual progress steps (dots/lines)
  updateProgressSteps(item.status);

  // 2. Set the text for various labels
  const foodTypeEl = document.getElementById("trackFood");
  if (foodTypeEl)
    foodTypeEl.innerHTML = "<span>Food Type</span>" + item.food_name;

  const qtyEl = document.getElementById("trackQty");
  if (qtyEl) qtyEl.innerHTML = "<span>Quantity</span>" + item.approx_quantity;

  const addressEl = document.getElementById("trackAddress");
  if (addressEl)
    addressEl.innerHTML = "<span>Pickup Address</span>" + item.address;

  const trustEl = document.getElementById("trackTrust");
  if (trustEl)
    trustEl.innerHTML =
      "<span>Assigned Trust</span>" + (item.trust_name || "Looking...");

  // 4. Update the main status heading message
  const statusMsgEl = document.querySelector(".status-message");
  if (statusMsgEl) {
    const s = item.status.toLowerCase();
    let displayMsg = "Status: " + item.status;

    if (s === "pending") displayMsg = "Waiting for trust...";
    else if (s === "accepted") displayMsg = "Trust accepted!";
    else if (s === "reached") displayMsg = "At your location!";
    else if (s === "picked") displayMsg = "Food picked up!";
    else if (s === "completed") displayMsg = "Success!";

    statusMsgEl.innerText = displayMsg;
    statusMsgEl.className = "status-message " + s;
  }
}

// This function highlights the "steps" (Pending -> Accepted -> Reached -> Picked -> Completed)
function updateProgressSteps(status) {
  const statusOrder = ["pending", "accepted", "reached", "picked", "completed"];
  const currentLevel = statusOrder.indexOf(status.toLowerCase());

  const allStepElements = document.querySelectorAll(".step");

  for (let i = 0; i < allStepElements.length; i++) {
    const step = allStepElements[i];
    // If the step index is less than or equal to our current status level, make it active
    if (i <= currentLevel) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  }
}
