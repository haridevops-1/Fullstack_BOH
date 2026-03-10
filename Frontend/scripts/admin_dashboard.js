import { BACKEND_URL, getAuthHeaders, checkAuth } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth("admin")) return;
  getAdminSummary();
  loadPendingTrusts();
});

async function getAdminSummary() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeaders() });
    if (response.ok) {
      const stats = await response.json();
      if (document.getElementById("pendingCount")) document.getElementById("pendingCount").innerText = stats.total_pending_trusts;
      if (document.getElementById("verifiedCount")) document.getElementById("verifiedCount").innerText = stats.verified_trusts;
      if (document.getElementById("donorCount")) document.getElementById("donorCount").innerText = stats.total_donors;
    }
  } catch (e) { console.error(e); }
}

async function loadPendingTrusts() {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/pending_trusts`, { headers: getAuthHeaders() });
    if (response.ok) {
      const trusts = await response.json();
      tableBody.innerHTML = trusts.length ? "" : '<tr><td colspan="6" style="text-align:center;">No pending registrations.</td></tr>';
      trusts.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${t.trust_name}</td>
                    <td>${t.license_number}</td>
                    <td>${t.city}</td>
                    <td><button class='view-btn' onclick="window.viewTrustPhoto('${t.trust_photo}')">View Photo</button></td>
                    <td><span class='status-pending'>PENDING</span></td>
                    <td class='action-cell'>
                        <button class='approve-btn' onclick="window.respondToTrust(${t.id}, 'approve')">Approve</button>
                        <button class='reject-btn' onclick="window.respondToTrust(${t.id}, 'reject')">Reject</button>
                    </td>`;
        tableBody.appendChild(row);
      });
    }
  } catch (e) { tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error.</td></tr>'; }
}

window.respondToTrust = async (id, action) => {
  if (!confirm(`Are you sure you want to ${action} this trust?`)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/verify_trust/${id}?action=${action}`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    if (response.ok) {
      alert(`Trust ${action}ed!`);
      location.reload();
    }
  } catch (e) { alert("Error."); }
};

window.viewTrustPhoto = (photo) => {
  if (!photo || photo === "null") return alert("No photo.");
  window.open("").document.write(`<img src="${photo}" style="max-width:100%;">`);
};

window.logout = () => {
  localStorage.clear();
  window.location.href = "../index.html";
};
