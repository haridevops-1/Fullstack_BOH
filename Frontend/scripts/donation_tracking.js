import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

let lastStatus = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth("donor")) return;
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) {
    fetchDonation(id, true);
    // Poll for status updates every 7 seconds
    setInterval(() => fetchDonation(id, false), 7000);
  } else {
    window.location.href = "Donor_dashboard.html";
  }
});

async function fetchDonation(id, isInitial = false) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/donor/donations/${id}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const item = await res.json();
      updateUI(item);

      const newStatus = item.status.toLowerCase();
      if (!isInitial && lastStatus && lastStatus !== newStatus) {
        const msgs = {
          accepted: "Trust accepted your donation!",
          reached: "Vehicle reached your location!",
          picked: "Food picked up successfully!",
          completed: "Donation process complete!"
        };
        showToast(msgs[newStatus] || `Status updated: ${item.status}`, newStatus);
      }
      lastStatus = newStatus;
    }
  } catch (e) { console.error("Polling error:", e); }
}

function showToast(message, status) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast status-update ${status}`;
  const icons = { accepted: "✅", reached: "📍", picked: "📦", completed: "🎉" };
  toast.innerHTML = `<span class="toast-icon">${icons[status] || "🔔"}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(() => toast.remove(), 500);
  }, 6000);
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
    const group = document.getElementById("liveTrackingGroup");
    if (group) group.style.display = "block";
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
    msg.className = "status-message " + s;
  }

  if (item.proof_image) {
    const infoSection = document.querySelector(".info-section") || document.querySelector(".donation-card");
    // Check if proof already exists to avoid duplicates during polling
    if (!document.getElementById("proofImageDisplay")) {
      const div = document.createElement("div");
      div.id = "proofImageDisplay";
      div.style.marginTop = "20px";
      div.innerHTML = `<h3 style="margin-bottom:10px;">Pickup Proof:</h3><img src="${item.proof_image}" style="max-width:100%; border-radius:10px; border: 2px solid #e2e8f0;">`;
      infoSection.appendChild(div);
    }
  }
}

function updateSteps(status) {
  const order = ["pending", "accepted", "reached", "picked", "completed"];
  const level = order.indexOf(status.toLowerCase());
  document.querySelectorAll(".step").forEach((step, i) => step.classList.toggle("active", i <= level));
}
