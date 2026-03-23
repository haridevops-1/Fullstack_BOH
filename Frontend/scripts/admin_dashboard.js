import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

// This function runs when the admin dashboard page starts up
document.addEventListener("DOMContentLoaded", function () {
  // 1. Make sure only admins can access this page
  if (checkAuth("admin") === false) {
    return;
  }

  // 2. Fetch the overall summary (stats)
  getAdminSummary();

  // 3. Load the list of trusts that are waiting for approval
  loadPendingTrusts();
});

// This function fetches the total counts (pending, verified, donors)
async function getAdminSummary() {
  try {
    const response = await fetch(BACKEND_URL + "/api/admin/stats", {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const stats = await response.json();

      // Update the numbers on the page
      const pendingText = document.getElementById("pendingCount");
      const verifiedText = document.getElementById("verifiedCount");
      const donorText = document.getElementById("donorCount");

      if (pendingText) {
        pendingText.innerText = stats.total_pending_trusts;
      }
      if (verifiedText) {
        verifiedText.innerText = stats.verified_trusts;
      }
      if (donorText) {
        donorText.innerText = stats.total_donors;
      }
    }
  } catch (error) {
    console.error("Error getting summary:", error);
  }
}

// This function fetches and displays the trusts waiting for approval
async function loadPendingTrusts() {
  const tableBody = document.querySelector("tbody");
  
  // Show a loading message while we wait
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading pending trusts...</td></tr>';

  try {
    const response = await fetch(BACKEND_URL + "/api/admin/pending_trusts", {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const trusts = await response.json();

      // Clear the loading message
      tableBody.innerHTML = "";

      // If there are no trusts to show
      if (trusts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No pending registrations found.</td></tr>';
      } else {
        // Loop through each trust and create a table row
        for (let i = 0; i < trusts.length; i++) {
          const t = trusts[i];
          const row = document.createElement("tr");

          // Build the row content
          row.innerHTML = 
            '<td>' + t.trust_name + '</td>' +
            '<td>' + t.license_number + '</td>' +
            '<td>' + t.city + '</td>' +
            '<td><button class="view-btn" onclick="window.viewTrustPhoto(\'' + t.trust_photo + '\')">View Photo</button></td>' +
            '<td><span class="status-pending">PENDING</span></td>' +
            '<td class="action-cell">' +
              '<button class="approve-btn" onclick="window.respondToTrust(' + t.id + ', \'approve\')">Approve</button>' +
              '<button class="reject-btn" onclick="window.respondToTrust(' + t.id + ', \'reject\')">Reject</button>' +
            '</td>';

          tableBody.appendChild(row);
        }
      }
    }
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error loading data.</td></tr>';
  }
}

// This function handles Approve or Reject clicks
window.respondToTrust = async function (id, action) {
  // Ask for confirmation
  const userConfirmed = confirm("Are you sure you want to " + action + " this trust?");
  if (userConfirmed === false) {
    return;
  }

  try {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) loadingOverlay.style.display = "flex";

    // Send the decision to the server
    const response = await fetch(
      BACKEND_URL + "/api/admin/verify_trust/" + id + "?action=" + action,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok === true) {
      showToast("Trust " + action + "ed successfully!", "success");
      setTimeout(() => location.reload(), 2000); // Refresh the page after toast
    } else {
      const errorData = await response.json();
      showToast("Verification failed: " + (errorData.detail || "Server error"), "error");
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }
  } catch (error) {
    showToast("Error communicating with server.", "error");
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) loadingOverlay.style.display = "none";
  }
};

// This function opens the trust verification photo in a new window
window.viewTrustPhoto = function (photo) {
  if (!photo || photo === "null") {
    showToast("No photo available for this trust.", "warning");
    return;
  }
  
  const newWindow = window.open("");
  newWindow.document.write('<img src="' + photo + '" style="max-width:100%;">');
};

// This function logs the admin out
window.logout = function () {
  localStorage.clear();
  window.location.href = "../index.html";
};
