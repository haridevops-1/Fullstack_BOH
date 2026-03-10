import { BACKEND_URL, getAuthHeaders, checkAuth, formatDate } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth("trust")) fetchAccepted();
});

async function fetchAccepted() {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.getElementById("acceptedTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

  try {
    const res = await fetch(`${BACKEND_URL}/api/trust/accepted_details?trust_id=${trustId}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const list = await res.json();
      tableBody.innerHTML = list.length ? "" : '<tr><td colspan="6" style="text-align:center;">No accepted requests.</td></tr>';
      list.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${item.name || "Anonymous"}</td>
                    <td>${item.food_name}</td>
                    <td>${item.approx_quantity}</td>
                    <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
                    <td>${formatDate(item.created_at)}</td>
                    <td><button class="update-tracking-btn" onclick="window.location.href='Trust_update.html?id=${item.id}'">Update</button></td>`;
        tableBody.appendChild(row);
      });
    }
  } catch (e) { tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error.</td></tr>'; }
}
