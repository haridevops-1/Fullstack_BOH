// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var donationId = params.get("id");

  // Check if donation ID exists
  if (!donationId) {
    var main = document.querySelector("main");

    if (main) {
      main.innerHTML =
        '<div style="text-align:center;padding:100px 20px;">' +
        "<h2>No Donation Selected</h2>" +
        "<p>Please go back to dashboard and select a donation.</p>" +
        '<a href="Trust_dashboard.html" style="padding:12px 25px;background:#134b85;color:white;text-decoration:none;border-radius:8px;">Go to Dashboard</a>' +
        "</div>";
    }

    return;
  }

  fetchDonationRecordForUpdate(donationId);
  setupImagePreview();

  var btn = document.getElementById("updateStatusBtn");

  if (btn) {
    btn.onclick = function () {
      sendStatusUpdate(donationId);
    };
  }
});

/* -----------------------------
   Image preview
----------------------------- */

function setupImagePreview() {
  var fileInput = document.getElementById("proofImage");
  var preview = document.getElementById("previewImg");

  if (!fileInput) return;

  fileInput.onchange = function () {
    var file = fileInput.files[0];

    if (!file) return;

    var reader = new FileReader();

    reader.onload = function (e) {
      if (preview) {
        preview.src = e.target.result;
        preview.style.display = "block";
      }
    };

    reader.readAsDataURL(file);
  };
}

/* -----------------------------
   Load donation details
----------------------------- */

async function fetchDonationRecordForUpdate(id) {
  try {
    var response = await fetch(BACKEND_URL + "/api/donor/donations/" + id);

    if (response.ok) {
      var item = await response.json();

      var food = document.getElementById("updateFood");
      var qty = document.getElementById("updateQty");
      var donor = document.getElementById("updateDonor");
      var phone = document.getElementById("updatePhone");
      var address = document.getElementById("updateAddress");
      var status = document.getElementById("statusSelect");

      if (food) food.innerText = item.food_name;
      if (qty) qty.innerText = item.approx_quantity;
      if (donor) donor.innerText = item.name;
      if (phone) phone.innerText = item.mobile_number;

      if (address) {
        address.innerText = item.address + ", " + item.city;
      }

      if (status) {
        status.value = item.status.toLowerCase();
      }
    } else {
      alert("No record found!");

      window.location.href = "Trust_dashboard.html";
    }
  } catch (error) {
    console.log("Error:", error);

    alert("Connection error. Is backend running?");
  }
}

/* -----------------------------
   Send status update
----------------------------- */

async function sendStatusUpdate(id) {
  var statusSelect = document.getElementById("statusSelect");
  var fileInput = document.getElementById("proofImage");

  var newStatus = statusSelect ? statusSelect.value : "pending";

  var update = {
    status: newStatus,
  };

  // Convert image to Base64
  if (fileInput && fileInput.files[0]) {
    var file = fileInput.files[0];

    var base64 = await new Promise(function (resolve) {
      var reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result);
      };

      reader.readAsDataURL(file);
    });

    update.proof_image = base64;
  }

  try {
    var response = await fetch(
      BACKEND_URL + "/api/trust/donations/" + id + "/status",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      },
    );

    if (response.ok) {
      alert("Donation updated to " + newStatus);

      if (newStatus === "completed") {
        window.location.href = "Trust_dashboard.html";
      } else {
        location.reload();
      }
    } else {
      alert("Update failed. Please try again.");
    }
  } catch (error) {
    alert("Connection error. Server offline.");
  }
}
