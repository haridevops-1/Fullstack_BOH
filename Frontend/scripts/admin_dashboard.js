// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get login data from localStorage
  var userId = localStorage.getItem("userId");
  var userRole = localStorage.getItem("userRole");

  // Check admin login
  if (!userId || userRole !== "admin") {
    alert("Admin login required!");
    window.location.href = "login.html";
    return;
  }

  // Load dashboard data
  getAdminSummary();
  loadPendingTrusts();
});

/* -------------------------------
   Get dashboard statistics
--------------------------------*/
async function getAdminSummary() {
  try {
    var response = await fetch(BACKEND_URL + "/api/admin/stats");

    if (response.ok) {
      var stats = await response.json();

      var pending = document.getElementById("pendingCount");
      var verified = document.getElementById("verifiedCount");
      var donors = document.getElementById("donorCount");

      if (pending) {
        pending.innerText = stats.total_pending_trusts;
      }

      if (verified) {
        verified.innerText = stats.verified_trusts;
      }

      if (donors) {
        donors.innerText = stats.total_donors;
      }
    }
  } catch (error) {
    console.log("Error loading stats:", error);
  }
}

/* -------------------------------
   Load pending trusts
--------------------------------*/
async function loadPendingTrusts() {
  var tableBody = document.querySelector("tbody");

  tableBody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;">Looking for new trust registrations...</td></tr>';

  try {
    var response = await fetch(BACKEND_URL + "/api/admin/pending_trusts");

    if (response.ok) {
      var trusts = await response.json();

      tableBody.innerHTML = "";

      for (var i = 0; i < trusts.length; i++) {
        var trust = trusts[i];

        var row = document.createElement("tr");

        row.innerHTML =
          "<td>" +
          trust.trust_name +
          "</td>" +
          "<td>" +
          trust.license_number +
          "</td>" +
          "<td>" +
          trust.city +
          "</td>" +
          "<td><button class='view-btn' onclick=\"viewTrustPhoto('" +
          trust.trust_photo +
          "')\">View Photo</button></td>" +
          "<td><span class='status-pending'>PENDING</span></td>" +
          "<td class='action-cell'>" +
          "<button class='approve-btn' onclick=\"respondToTrust(" +
          trust.id +
          ", 'approve')\">Approve</button>" +
          "<button class='reject-btn' onclick=\"respondToTrust(" +
          trust.id +
          ", 'reject')\">Reject</button>" +
          "</td>";

        tableBody.appendChild(row);
      }

      // If no trusts found
      if (trusts.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;padding:40px;">No pending trust registrations.</td></tr>';
      }
    }
  } catch (error) {
    console.log("Connection error:", error);

    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:red;">Backend connection error.</td></tr>';
  }
}

/* -------------------------------
   Approve or Reject trust
--------------------------------*/
async function respondToTrust(id, action) {
  var confirmAction = confirm(
    "Are you sure you want to " + action + " this trust?",
  );

  if (!confirmAction) {
    return;
  }

  try {
    var response = await fetch(
      BACKEND_URL + "/api/admin/verify_trust/" + id + "?action=" + action,
      { method: "PUT" },
    );

    if (response.ok) {
      alert("Trust " + action + "ed successfully!");

      location.reload();
    } else {
      alert("Failed to perform action.");
    }
  } catch (error) {
    alert("Server error.");
  }
}

/* -------------------------------
   View trust photo
--------------------------------*/
function viewTrustPhoto(photo) {
  if (!photo || photo === "null") {
    alert("No photo uploaded.");
    return;
  }

  var newWindow = window.open("");

  newWindow.document.write('<img src="' + photo + '" style="max-width:100%;">');
}

/* -------------------------------
   Logout
--------------------------------*/
document.addEventListener("click", function (event) {
  var text = event.target.innerText;

  if (text && text.toLowerCase().includes("logout")) {
    localStorage.clear();

    window.location.href = "../index.html";
  }
});
