import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth("trust")) fetchRejected();
});

async function fetchRejected() {
  const trustId = localStorage.getItem("userId");
  const container = document.querySelector(".container");
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;padding:20px;">Loading rejection history...</p>';

  try {
    const res = await fetch(`${BACKEND_URL}/api/trust/rejected_details?trust_id=${trustId}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const list = await res.json();
      container.innerHTML = list.length ? "" : '<p style="text-align:center;color:#666;margin-top:50px;">No rejected requests found.</p>';

      list.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
                    <h3>${item.food_name}</h3>
                    <p><strong>Quantity:</strong> ${item.approx_quantity}</p>
                    <p><strong>Donor Name:</strong> ${item.name || "Anonymous"}</p>
                    <p><strong>Location:</strong> ${item.city}</p>
                    <div style="margin:15px 0;">
                        <span class="status rejected" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:4px 12px;border-radius:20px;font-weight:700;">
                            ${item.status}
                        </span>
                    </div>`;
        container.appendChild(card);
      });
    }
  } catch (e) { container.innerHTML = '<p style="text-align:center;color:red;">Error.</p>'; }
}
