import { BACKEND_URL, getAuthHeaders, checkAuth, showToast } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("donor")) return;
  const params = new URLSearchParams(window.location.search);
  const trustName = params.get("trustName");
  if (trustName)
    document.querySelector(".head h1").innerText = `Donating to ${trustName}`;

  const form = document.querySelector("form");
  if (form) form.onsubmit = handleDonationSubmit;
});

async function handleDonationSubmit(event) {
  event.preventDefault();
  
  const params = new URLSearchParams(window.location.search);
  const trustId = params.get("trustId");
  const donorId = localStorage.getItem("userId");

  if (!trustId) {
    alert("Error: No trust selected. Please select a trust from the list first.");
    return;
  }

  // Get field values
  const contactName = document.getElementById("contactName").value.trim();
  const mobileNumber = document.getElementById("mobileNumber").value.trim();
  const foodName = document.getElementById("foodName").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  // Simple Validation Checklist
  if (foodName === "") {
    showToast("Please enter the name of the food you are donating.", "warning");
    return;
  }
  if (quantity === "") {
    showToast("Please enter the approximate quantity.", "warning");
    return;
  }
  if (mobileNumber === "" || mobileNumber.length < 10) {
    showToast("Please enter a valid 10-digit mobile number.", "warning");
    return;
  }
  if (address === "") {
    showToast("Please enter the pickup address.", "warning");
    return;
  }
  if (city === "") {
    showToast("Please enter the city.", "warning");
    return;
  }
  if (!document.getElementById("pickupTime").value) {
    showToast("Please select your preferred pickup time.", "warning");
    return;
  }

  const data = {
    name: contactName || "Donor",
    mobile_number: mobileNumber,
    food_name: foodName,
    category: document.getElementById("category").value,
    approx_quantity: quantity,
    address: address,
    area_landmark: document.getElementById("landmark").value,
    city: city,
    pincode: pincode,
    notes: document.getElementById("notes").value,
    scheduled_time: document.getElementById("pickupTime").value,
  };

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/donor/new_donation?trust_id=${trustId}&donor_id=${donorId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
    );
 
    if (res.ok) {
      showToast("Success: Your donation request has been submitted.", "success");
      setTimeout(() => {
        window.location.href = "Donor_dashboard.html";
      }, 2000);
    } else {
      const err = await res.json();
      showToast(`Failed to send request: ${err.detail || "Please check your details."}`, "error");
    }
  } catch (e) {
    showToast("Error: Could not connect to the server.", "error");
  }
}
