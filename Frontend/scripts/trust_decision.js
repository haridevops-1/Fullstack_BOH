// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);

  var donationId = params.get("id");

  if (donationId) {
    getDonationInfo(donationId);
  } else {
    alert("Donation ID not found!");
    window.location.href = "Trust_dashboard.html";
  }
});

/* -----------------------------
   Get donation details
----------------------------- */

async function getDonationInfo(id) {
  try {
    var response = await fetch(BACKEND_URL + "/api/donor/donations/" + id);

    if (response.ok) {
      var item = await response.json();

      // Show donation details
      var donor = document.getElementById("detDonor");
      var food = document.getElementById("detFood");
      var category = document.getElementById("detCategory");
      var qty = document.getElementById("detQty");
      var phone = document.getElementById("detPhone");
      var address = document.getElementById("detAddress");
      var city = document.getElementById("detCity");
      var pincode = document.getElementById("detPincode");

      if (donor) donor.innerText = item.name || "Anonymous";
      if (food) food.innerText = item.food_name;
      if (category) {
        var cat = (item.category || "veg").toLowerCase();
        category.innerHTML = '<span class="category-badge ' + cat + '">' + cat + '</span>';
      }
      if (qty) qty.innerText = item.approx_quantity;
      if (phone) phone.innerText = item.mobile_number;
      if (address) address.innerText = item.address;
      if (city) city.innerText = item.city;
      if (pincode) pincode.innerText = item.pincode || "N/A";

      // Setup buttons
      var acceptBtn = document.getElementById("acceptBtn");
      var rejectBtn = document.getElementById("rejectBtn");

      if (acceptBtn) {
        acceptBtn.onclick = function () {
          updateMyDecision(id, "accepted");
        };
      }

      if (rejectBtn) {
        rejectBtn.onclick = function () {
          updateMyDecision(id, "rejected");
        };
      }
    } else {
      alert("No donation found!");
      window.location.href = "Trust_dashboard.html";
    }
  } catch (error) {
    console.log("Error:", error);

    alert("Connection error. Is the server running?");
  }
}

/* -----------------------------
   Update donation decision
----------------------------- */

async function updateMyDecision(id, status) {
  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/donations/" + id + "/status",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status }),
      },
    );

    if (response.ok) {
      alert("Decision saved successfully!");

      window.location.href = "Trust_dashboard.html";
    } else {
      alert("Could not save your decision.");
    }
  } catch (error) {
    console.log("Error:", error);

    alert("Server error. Please try again.");
  }
}
