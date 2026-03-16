import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

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
    alert("Please enter the name of the food you are donating.");
    return;
  }
  if (quantity === "") {
    alert("Please enter the approximate quantity.");
    return;
  }
  if (mobileNumber === "" || mobileNumber.length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  // Check if mobile number contains ONLY numbers
  let isOnlyNumbers = true;
  for (let i = 0; i < mobileNumber.length; i++) {
    if (mobileNumber[i] < "0" || mobileNumber[i] > "9") {
      isOnlyNumbers = false;
      break;
    }
  }

  if (isOnlyNumbers === false) {
    alert("Error: Mobile number must contain only numbers (0-9).");
    return;
  }
  if (address === "") {
    alert("Please enter the pickup address.");
    return;
  }
  if (city === "") {
    alert("Please enter the city.");
    return;
  }
  if (pincode === "") {
    alert("Please enter the pincode.");
    return;
  }

  // Pincode validation: only numbers and at least 6 digits
  let isPincodeNumeric = true;
  for (let i = 0; i < pincode.length; i++) {
    if (pincode[i] < "0" || pincode[i] > "9") {
      isPincodeNumeric = false;
      break;
    }
  }
  if (isPincodeNumeric === false || pincode.length < 6) {
    alert("Error: Pincode must be at least 6 numbers.");
    return;
  }

  // Quantity validation: ensure it's a positive number
  if (quantity <= 0) {
    alert("Error: Quantity must be at least 1.");
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
      alert("Success: Your donation request has been submitted.");
      window.location.href = "Donor_dashboard.html";
    } else {
      const err = await res.json();
      alert(
        `Failed to send request: ${err.detail || "Please check your details."}`,
      );
    }
  } catch (e) {
    alert("Error: Could not connect to the server.");
  }
}
