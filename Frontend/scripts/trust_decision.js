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
  } catch (e) { alert("Error loading details. Try again."); }
}

async function updateDecision(id, status) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/trust/donations/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      alert("Success: Your decision has been saved.");
      window.location.href = "Trust_dashboard.html";
    } else {
      const err = await res.json();
      alert(`Failed to save decision: ${err.detail || "Server error"}`);
    }
  } catch (e) { alert("Error: Could not connect to the server."); }
}
