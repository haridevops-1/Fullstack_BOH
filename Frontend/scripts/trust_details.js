import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth("trust")) fetchIncomingRequests();
});

async function fetchIncomingRequests() {
  const trustId = localStorage.getItem("userId");
  const container = document.querySelector(".container");
  if (!container) return;

  container.innerHTML =
    '<p style="text-align:center;padding:20px;">Fetching new requests...</p>';

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/trust/donations_details?trust_id=${trustId}`,
      { headers: getAuthHeaders() },
    );
    if (response.ok) {
      const donations = await response.json();
      const pending = donations.filter(
        (d) => d.status.toLowerCase() === "pending",
      );

      container.innerHTML = pending.length
        ? ""
        : `
                <div style="text-align:center;padding:80px;background:white;border-radius:12px;border:1px solid #eaecf0;">
                    <p style="color:#64748b;font-size:18px;font-weight:500;">No new incoming requests.</p>
                </div>`;

      pending.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card pending-card-row";
        const cat = (item.category || "veg").toLowerCase();

        card.innerHTML = `
                    <div class="card-header-top"><h4>Food: ${item.food_name}</h4></div>
                    <div class="card-body-details">
                        <div class="detail-row"><strong>Quantity:</strong> ${item.approx_quantity}</div>
                        <div class="detail-row"><strong>Type:</strong> <span class="category-badge ${cat}">${cat}</span></div>
                        <div class="detail-row"><strong>Donor:</strong> ${item.name || "Anonymous"}</div>
                        <div class="detail-row"><strong>City:</strong> ${item.city}</div>
                    </div>
                    <div class="card-footer-action">
                        <button class="decide-btn" onclick="window.location.href='Trust_decision.html?id=${item.id}'">View & Decide</button>
                    </div>`;
        container.appendChild(card);
      });
    }
  } catch (e) {
    container.innerHTML =
      '<p style="color:red;text-align:center;">Error loading requests.</p>';
  }
}
