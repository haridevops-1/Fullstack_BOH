import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("donor")) return;
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) fetchDonation(id);
  else window.location.href = "Donor_dashboard.html";
});

async function fetchDonation(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/donor/donations/${id}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const item = await res.json();
      updateUI(item);
    }
  } catch (e) { alert("Error."); }
}

function updateUI(item) {
  updateSteps(item.status);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  const htmlSet = (id, label, val) => { const el = document.getElementById(id); if (el) el.innerHTML = `<span>${label}</span>${val}`; };

  htmlSet("trackFood", "Food Type", item.food_name);
  htmlSet("trackQty", "Quantity", item.approx_quantity);
  htmlSet("trackAddress", "Pickup Address", item.address);
  htmlSet("trackTrust", "Assigned Trust", item.trust_name || "Looking...");

  if (item.driver_name || item.vehicle_number) {
    document.getElementById("liveTrackingGroup").style.display = "block";
    set("trackDriver", item.driver_name || "--");
    set("trackPhone", item.driver_phone || "--");
    set("trackVehicle", item.vehicle_number || "--");
    set("trackEta", item.eta || "--");
  }

  const msg = document.querySelector(".status-message");
  if (msg) {
    const s = item.status.toLowerCase();
    const msgs = { pending: "Waiting for trust...", accepted: "Trust accepted!", reached: "At your location!", picked: "Food picked up!", completed: "Success!" };
    msg.innerText = msgs[s] || `Status: ${item.status}`;
  }

  if (item.proof_image) {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Proof:</h3><img src="${item.proof_image}" style="max-width:100%; border-radius:10px;">`;
    document.querySelector(".info-section").appendChild(div);
  }
}

function updateSteps(status) {
  const order = ["pending", "accepted", "reached", "picked", "completed"];
  const level = order.indexOf(status.toLowerCase());
  document.querySelectorAll(".step").forEach((step, i) => step.classList.toggle("active", i <= level));
}
