import { BACKEND_URL, getAuthHeaders, checkAuth, logout } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth("donor")) loadTrustList();
  window.logout = logout;
});

async function loadTrustList() {
  const container = document.querySelector(".all-container");
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:40px;width:100%;grid-column:1/-1;">Finding trusts...</div>';

  const city = localStorage.getItem("userCity") || "your area";
  const heading = document.querySelector(".main-headings h2");
  if (heading) heading.innerText = `Find Trusts in ${city}`;

  try {
    const response = await fetch(`${BACKEND_URL}/api/donor/all_trusts`, { headers: getAuthHeaders() });
    if (response.ok) {
      const trusts = await response.json();
      container.innerHTML = trusts.length ? "" : '<div style="text-align:center;color:grey;width:100%;grid-column:1/-1;padding:60px;">No trusts found.</div>';

      trusts.forEach(item => {
        const card = document.createElement("div");
        card.className = "trust-card";
        card.innerHTML = `
                    <div class="image-wrapper">
                        <img src="${item.trust_photo || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop'}">
                        <div class="verified-badge">✓ Verified</div>
                    </div>
                    <div class="details">
                        <div class="trust-name">${item.trust_name || "Verified Trust"}</div>
                        <div class="info-group">
                            <div class="info-item"><span class="label">Mobile</span><span class="value">${item.mobile_number || "Contact Admin"}</span></div>
                            <div class="info-item"><span class="label">Address</span><span class="value">${item.trust_address || "Not specified"}</span></div>
                            <div class="info-item"><span class="label">City</span><span class="value">${item.city || "Not specified"}</span></div>
                        </div>
                        <button class="donate-btn-large">Donate Now</button>
                    </div>`;

        card.querySelector("button").onclick = () => {
          window.location.href = `create_donation.html?trustId=${item.id}&trustName=${encodeURIComponent(item.trust_name)}`;
        };
        container.appendChild(card);
      });
    }
  } catch (e) { container.innerHTML = '<div style="text-align:center;color:red;width:100%;grid-column:1/-1;padding:40px;">Connection error.</div>'; }
}
