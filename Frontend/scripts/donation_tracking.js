// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get donation ID from URL
  var params = new URLSearchParams(window.location.search);
  var donationId = params.get("id");

  // Check if donation ID exists
  if (donationId) {
    fetchDonationRecord(donationId);
  } else {
    console.warn("No Donation ID in URL");

    alert("You didn't select a donation to track. Returning to dashboard.");

    window.location.href = "Donor_dashboard.html";
  }
});

/* -----------------------------
   Fetch donation record
----------------------------- */
async function fetchDonationRecord(id) {
  // var heading = document.querySelector("h1");
  // var statsContainer = document.querySelector(".stats-container");

  try {
    var response = await fetch(BACKEND_URL + "/api/donor/donations/" + id);

    if (response.ok) {
      var item = await response.json();

      // Update heading: Keep the original "BridgeOfHope" logo from HTML
      /* if (heading) {
        heading.innerText = "Tracking: " + item.food_name;
      } */

      // Update progress steps
      updateStatusSteps(item.status);

      // Update info boxes to show actual data instead of "Loading..."
      const foodBox = document.getElementById("trackFood");
      const qtyBox = document.getElementById("trackQty");
      const addrBox = document.getElementById("trackAddress");
      const trustBox = document.getElementById("trackTrust");

      if (foodBox) foodBox.innerHTML = `<span>Food Type</span>${item.food_name}`;
      if (qtyBox) qtyBox.innerHTML = `<span>Quantity</span>${item.approx_quantity}`;
      if (addrBox) addrBox.innerHTML = `<span>Pickup Address</span>${item.address}`;
      if (trustBox) {
        trustBox.innerHTML = `<span>Assigned Trust</span>${item.trust_name || "Looking for trust..."}`;
      }


      //  Driver tracking info


      if (item.driver_name || item.vehicle_number) {
        var tracking = document.getElementById("liveTrackingGroup");

        if (tracking) {
          tracking.style.display = "block";

          if (document.getElementById("trackDriver"))
            document.getElementById("trackDriver").innerText =
              item.driver_name || "--";

          if (document.getElementById("trackPhone"))
            document.getElementById("trackPhone").innerText =
              item.driver_phone || "--";

          if (document.getElementById("trackVehicle"))
            document.getElementById("trackVehicle").innerText =
              item.vehicle_number || "--";

          if (document.getElementById("trackEta"))
            document.getElementById("trackEta").innerText = item.eta || "--";
        }
      }

      /* -----------------------------
               Status message
            ----------------------------- */

      var msg = document.querySelector(".status-message");

      if (msg) {
        var status = item.status.toLowerCase();

        if (status === "pending")
          msg.innerText = "Donation request sent! Waiting for trust to accept.";
        else if (status === "accepted")
          msg.innerText = "Trust accepted your donation.";
        else if (status === "reached")
          msg.innerText = "Trust has reached your location.";
        else if (status === "picked")
          msg.innerText = "Food has been picked up.";
        else if (status === "completed")
          msg.innerText = "Success! Food delivered.";
        else msg.innerText = "Current status: " + item.status;
      }

      /* -----------------------------
               Proof image
            ----------------------------- */

      var infoSection = document.querySelector(".info-section");

      if (infoSection && item.proof_image) {
        var photoDiv = document.createElement("div");

        photoDiv.style.textAlign = "center";
        photoDiv.style.marginTop = "20px";

        photoDiv.innerHTML =
          "<h3>Proof of Delivery/Service:</h3>" +
          '<img src="' +
          item.proof_image +
          '" style="max-width:100%; border-radius:10px; margin-top:10px;">';

        infoSection.appendChild(photoDiv);
      }
    } else {
      console.log("Record not found");

      alert("No record found for this donation.");
    }
  } catch (error) {
    console.log("Error:", error);

    alert("Connection error. Is the backend running?");
  }
}

/* -----------------------------
   Update progress steps
----------------------------- */

function updateStatusSteps(currentStatus) {
  var steps = document.querySelectorAll(".step");

  var status = currentStatus.toLowerCase();

  var order = ["pending", "accepted", "reached", "picked", "completed"];

  var currentLevel = order.indexOf(status);

  for (var i = 0; i < steps.length; i++) {
    if (i <= currentLevel) {
      steps[i].classList.add("active");
    } else {
      steps[i].classList.remove("active");
    }
  }
}
