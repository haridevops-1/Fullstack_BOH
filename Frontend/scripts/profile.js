import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    // Show cached name immediately while loading full profile
    const cachedName = localStorage.getItem("userName");
    if (cachedName) {
      document.querySelector(".profile-name h3").innerText = cachedName;
      document.querySelector(".avatar").innerText = cachedName
        .charAt(0)
        .toUpperCase();
    }
    loadUserProfile();
  }
});

async function loadUserProfile() {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("userRole");
  const url =
    role === "donor"
      ? `${BACKEND_URL}/api/donor/profile/update?donor_id=${userId}`
      : `${BACKEND_URL}/api/trust/profile/?trust_id=${userId}`;

  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      showProfile(data, role);
    }
  } catch (e) {
    console.error("Error loading profile:", e);
  }
}

function showProfile(data, role) {
  const name =
    role === "donor" ? `${data.Firstname} ${data.Lastname}` : data.trust_name;
  const photo = role === "donor" ? data.photo : data.trust_photo;

  document.querySelector(".profile-name h3").innerText = name;
  const avatar = document.querySelector(".avatar");
  avatar.innerHTML =
    photo && photo !== "null"
      ? `<img src="${photo}">`
      : name.charAt(0).toUpperCase();

  // Update status pill
  const statusPill = document.querySelector(".status-pill");
  if (statusPill) {
    statusPill.innerText =
      role === "donor" ? "Account Status: Active" : "Account Status: Verified";
  }

  const grid = document.querySelector(".profile-grid");
  if (role === "donor") {
    grid.innerHTML = `
      ${item("First Name", data.Firstname)} ${item("Last Name", data.Lastname)}
      ${item("Email", data.email)} ${item("Phone", data.mobile_number)}
      ${item("City", data.city)} ${item("Pincode", data.Pincode || data.pincode)}`;
  } else {
    grid.innerHTML = `
      ${item("Trust Name", data.trust_name)} ${item("Email", data.email_id)}
      ${item("Phone", data.mobile_number)} ${item("Address", data.trust_address)}
      ${item("City", data.city)} ${item("Pincode", data.pincode)}`;
  }

  const btn = document.querySelector(".btn");
  btn.onclick = () =>
    btn.innerText.includes("Edit") ? startEdit(btn) : saveChanges(role);
}

const item = (l, v) =>
  `<div class="profile-item"><label>${l}</label><div class="info-value">${v}</div></div>`;

function startEdit(btn) {
  btn.innerText = "Save Changes";
  btn.style.background = "#10b981";
  document
    .querySelectorAll(".info-value")
    .forEach(
      (div) =>
        (div.innerHTML = `<input type="text" value="${div.innerText}" class="edit-input">`),
    );
}

async function saveChanges(role) {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) loadingOverlay.style.display = "flex";
  
  const userId = localStorage.getItem("userId");
  const inputs = document.querySelectorAll(".edit-input");

  // Simple Validation: Check if any input is empty
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value.trim() === "") {
      alert("Error: All fields are required. Please fill in all information.");
      if (loadingOverlay) loadingOverlay.style.display = "none";
      return; // Stop here if any field is empty
    }
  }

  const info =
    role === "donor"
      ? {
        Firstname: inputs[0].value.trim(),
        Lastname: inputs[1].value.trim(),
        email: inputs[2].value.trim(),
        mobile_number: inputs[3].value.trim(),
        city: inputs[4].value.trim(),
        Pincode: inputs[5].value.trim(),
      }
      : {
        trust_name: inputs[0].value.trim(),
        email_id: inputs[1].value.trim(),
        mobile_number: inputs[2].value.trim(),
        trust_address: inputs[3].value.trim(),
        city: inputs[4].value.trim(),
        pincode: inputs[5].value.trim(),
      };

  const url =
    role === "donor"
      ? `${BACKEND_URL}/api/donor/profile/update?donor_id=${userId}`
      : `${BACKEND_URL}/api/trust/profile/update?trust_id=${userId}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(info),
    });
    if (res.ok) {
      showToast("Success: Your profile has been updated.", "success");
      setTimeout(() => location.reload(), 2000);
    } else {
      const err = await res.json();
      showToast(`Failed to update profile: ${err.detail || "Server error"}`, "error");
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }
  } catch (e) {
    alert("Error: Could not connect to the server.");
    if (loadingOverlay) loadingOverlay.style.display = "none";
  }
}
