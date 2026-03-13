import { BACKEND_URL, getAuthHeaders, cheAuth } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("donor")) return;
  const params = new URLSearchParams(window.location.search);
  const trustName = params.get("trustName");
  if (trustName) document.querySelector(".head h1").innerText = `Donating to ${trustName}`;

  const form = document.querySelector("form");
  if (form) form.onsubmit = handleDonationSubmit;
});

async function handleDonationSubmit(event) {
  event.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const trustId = params.get("trustId");
  const donorId = localStorage.getItem("userId");

  if (!trustId) return alert("Please select a trust first.");

  const data = {
    name: document.getElementById("contactName").value,
    mobile_number: document.getElementById("mobileNumber").value,
    food_name: document.getElementById("foodName").value,
    category: document.getElementById("category").value,
    approx_quantity: document.getElementById("quantity").value,
    address: document.getElementById("address").value,
    area_landmark: document.getElementById("landmark").value,
    city: document.getElementById("city").value,
    pincode: document.getElementById("pincode").value,
    notes: document.getElementById("notes").value,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/donor/new_donation?trust_id=${trustId}&donor_id=${donorId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Success: Your donation request has been submitted.");
      window.location.href = "Donor_dashboard.html";
    } else {
      const err = await res.json();
      alert(`Failed to send request: ${err.detail || "Please check your details."}`);
    }
  } catch (e) { alert("Error: Could not connect to the server."); }
}
