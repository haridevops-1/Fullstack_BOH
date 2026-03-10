import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("trust")) return;
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) {
    fetchDonation(id);
    setupPreview();
    document.getElementById("updateStatusBtn").onclick = () => sendUpdate(id);
  } else {
    window.location.href = "Trust_dashboard.html";
  }
});

function setupPreview() {
  const input = document.getElementById("proofImage");
  const preview = document.getElementById("previewImg");
  if (!input) return;
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = "block"; };
    reader.readAsDataURL(file);
  };
}

async function fetchDonation(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/donor/donations/${id}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const item = await res.json();
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
      set("updateFood", item.food_name);
      set("updateQty", item.approx_quantity);
      set("updateDonor", item.name);
      set("updatePhone", item.mobile_number);
      set("updateAddress", `${item.address}, ${item.city}`);
      const sel = document.getElementById("statusSelect");
      if (sel) sel.value = item.status.toLowerCase();
    }
  } catch (e) { alert("Error loading details. Try again."); }
}

async function sendUpdate(id) {
  const status = document.getElementById("statusSelect").value;
  const update = { status };
  const file = document.getElementById("proofImage").files[0];

  if (file) {
    update.proof_image = await new Promise(r => {
      const rd = new FileReader();
      rd.onload = () => r(rd.result);
      rd.readAsDataURL(file);
    });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/trust/donations/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(update)
    });
    if (res.ok) {
      alert("Success: Donation status updated.");
      window.location.href = status === "completed" ? "Trust_dashboard.html" : location.href;
    } else {
      const err = await res.json();
      alert(`Failed to update status: ${err.detail || "Server error"}`);
    }
  } catch (e) { alert("Error: Could not connect to the server."); }
}
