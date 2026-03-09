// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";

// Store profile data
var profileData = {};

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadUserProfile();
});

/* -----------------------------
   Load user profile
----------------------------- */

async function loadUserProfile() {
  var userId = localStorage.getItem("userId");
  var role = localStorage.getItem("userRole");

  // Check session
  if (!userId || !role) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Choose API URL
    var url = "";

    if (role === "donor") {
      url = BACKEND_URL + "/api/donor/profile/update?donor_id=" + userId;
    } else {
      url = BACKEND_URL + "/api/trust/profile/?trust_id=" + userId;
    }

    var response = await fetch(url);

    if (response.ok) {
      var userInfo = await response.json();

      profileData = userInfo;

      showProfileOnPage(userInfo, role);
    } else {
      alert("Could not load your profile.");
    }
  } catch (error) {
    alert("Connection error. Is the server running?");
  }
}

/* -----------------------------
   Display profile on page
----------------------------- */

function showProfileOnPage(data, role) {
  var nameHeading = document.querySelector(".profile-name h3");
  var infoGrid = document.querySelector(".profile-grid");
  var avatar = document.querySelector(".avatar");

  // Full name
  var fullName = "";

  if (role === "donor") {
    fullName = data.Firstname + " " + data.Lastname;
  } else {
    fullName = data.trust_name;
  }

  // Show name
  if (nameHeading) {
    nameHeading.innerText = fullName;
  }

  /* -----------------------------
       Profile image
    ----------------------------- */

  var photoUrl = role === "donor" ? data.photo : data.trust_photo;

  if (photoUrl && photoUrl !== "null") {
    avatar.innerHTML = '<img src="' + photoUrl + '">';
  } else {
    avatar.innerHTML = fullName.charAt(0).toUpperCase();
  }

  /* -----------------------------
       Profile information
    ----------------------------- */

  if (role === "donor") {
    infoGrid.innerHTML = `
        <div class="profile-item"><label>First Name</label><div class="info-value">${data.Firstname}</div></div>
        <div class="profile-item"><label>Last Name</label><div class="info-value">${data.Lastname}</div></div>
        <div class="profile-item"><label>Email</label><div class="info-value">${data.email}</div></div>
        <div class="profile-item"><label>Phone</label><div class="info-value">${data.mobile_number}</div></div>
        <div class="profile-item"><label>City</label><div class="info-value">${data.city}</div></div>
        <div class="profile-item"><label>Pincode</label><div class="info-value">${data.Pincode || data.pincode}</div></div>
        `;
  } else {
    infoGrid.innerHTML = `
        <div class="profile-item"><label>Trust Name</label><div class="info-value">${data.trust_name}</div></div>
        <div class="profile-item"><label>Email</label><div class="info-value">${data.email_id}</div></div>
        <div class="profile-item"><label>Phone</label><div class="info-value">${data.mobile_number}</div></div>
        <div class="profile-item"><label>Address</label><div class="info-value">${data.trust_address}</div></div>
        <div class="profile-item"><label>City</label><div class="info-value">${data.city}</div></div>
        <div class="profile-item"><label>Pincode</label><div class="info-value">${data.pincode}</div></div>
        `;
  }

  /* -----------------------------
       Edit button
    ----------------------------- */

  var actionBtn = document.querySelector(".btn");

  if (actionBtn) {
    actionBtn.onclick = function () {
      if (actionBtn.innerText.includes("Edit")) {
        turnOnEditing(actionBtn);
      } else {
        saveProfileChanges(role);
      }
    };
  }
}

/* -----------------------------
   Enable editing mode
----------------------------- */

function turnOnEditing(button) {
  var values = document.querySelectorAll(".info-value");

  button.innerText = "Save Changes";
  button.style.background = "#10b981";

  values.forEach(function (div) {
    var text = div.innerText;

    div.innerHTML =
      '<input type="text" value="' + text + '" class="edit-input">';
  });

  // Add input styling
  var style = document.createElement("style");

  style.innerHTML = `
    .edit-input{
        width:100%;
        padding:8px;
        border:1px solid #ddd;
        border-radius:6px;
        font-size:14px;
    }
    `;

  document.head.appendChild(style);
}

/* -----------------------------
   Save profile changes
----------------------------- */

async function saveProfileChanges(role) {
  var userId = localStorage.getItem("userId");

  var inputs = document.querySelectorAll(".info-value input");

  var updatedInfo = {};

  if (role === "donor") {
    updatedInfo = {
      Firstname: inputs[0].value,
      Lastname: inputs[1].value,
      email: inputs[2].value,
      mobile_number: inputs[3].value,
      city: inputs[4].value,
      Pincode: inputs[5].value,
    };
  } else {
    updatedInfo = {
      trust_name: inputs[0].value,
      email_id: inputs[1].value,
      mobile_number: inputs[2].value,
      trust_address: inputs[3].value,
      city: inputs[4].value,
      pincode: inputs[5].value,
    };
  }

  try {
    var updateUrl = "";

    if (role === "donor") {
      updateUrl = BACKEND_URL + "/api/donor/profile/update?donor_id=" + userId;
    } else {
      updateUrl = BACKEND_URL + "/api/trust/profile/update?trust_id=" + userId;
    }

    var response = await fetch(updateUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedInfo),
    });

    if (response.ok) {
      alert("Profile updated successfully!");

      window.location.reload();
    } else {
      alert("Could not save changes.");
    }
  } catch (error) {
    alert("Server error. Please try again.");
  }
}
