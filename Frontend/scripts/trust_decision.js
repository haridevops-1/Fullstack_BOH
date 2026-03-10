import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("trust")) return;
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) getDonationInfo(id);
  else window.location.href = "Trust_dashboard.html";
});

async function getDonationInfo(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/donor/donations/${id}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const item = await res.json();
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
      set("detDonor", item.name || "Anonymous");
      set("detFood", item.food_name);
      set("detQty", item.approx_quantity);
      set("detPhone", item.mobile_number);
      set("detAddress", item.address);
      set("detCity", item.city);
      set("detPincode", item.pincode || "N/A");

      const cat = (item.category || "veg").toLowerCase();
      const catEl = document.getElementById("detCategory");
      if (catEl) catEl.innerHTML = `<span class="category-badge ${cat}">${cat}</span>`;

      document.getElementById("acceptBtn").onclick = () => updateDecision(id, "accepted");
      document.getElementById("rejectBtn").onclick = () => updateDecision(id, "rejected");
    }
  } catch (e) { alert("An unexpected error occurred while loading donation information. Please try again."); }
}

async function updateDecision(id, status) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/trust/donations/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      alert("Success! Your decision has been saved successfully.");
      window.location.href = "Trust_dashboard.html";
    }
  } catch (e) { alert("An unexpected error occurred while processing your decision. Please try again."); }
}
