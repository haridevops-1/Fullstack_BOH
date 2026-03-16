import { BACKEND_URL, getAuthHeaders, checkAuth } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth("trust")) fetchCompleted();
});

async function fetchCompleted() {
  const trustId = localStorage.getItem("userId");
  const tableBody = document.getElementById("completedTableBody");
  if (!tableBody) return;

  tableBody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;">Looking for completed works...</td></tr>';

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/trust/donations_details?trust_id=${trustId}`,
      { headers: getAuthHeaders() },
    );
    if (res.ok) {
      const list = await res.json();
      const completed = list.filter(
        (d) => d.status.toLowerCase() === "completed",
      );

      tableBody.innerHTML = completed.length
        ? ""
        : '<tr><td colspan="7" style="text-align:center;">No completed donations yet.</td></tr>';

      completed.forEach((item) => {
        const row = document.createElement("tr");
        const cat = (item.category || "veg").toLowerCase();
        row.innerHTML = `
                    <td>${item.name || "Anonymous"}</td>
                    <td>${item.food_name}</td>
                    <td><span class="category-badge ${cat}">${cat}</span></td>
                    <td>${item.approx_quantity}</td>
                    <td>${item.address || "N/A"}</td>
                    <td>${item.city}</td>
                    <td><span class="status completed">${item.status}</span></td>`;
        tableBody.appendChild(row);
      });
    }
  } catch (e) {
    tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;color:red;">Error.</td></tr>';
  }
}
