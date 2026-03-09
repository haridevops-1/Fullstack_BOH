// Backend API URL
var BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";


// Run when page loads
document.addEventListener("DOMContentLoaded", function () {

    verifyUser();
    fetchDonorRecentActivity();

});



/* -----------------------------
   Verify donor login
----------------------------- */

function verifyUser() {

    var userId = localStorage.getItem("userId");
    var role = localStorage.getItem("userRole");

    if (!userId || role !== "donor") {

        alert("Please login as a donor first!");
        window.location.href = "login.html";
        return;
    }

    var userName = localStorage.getItem("userName");

    if (userName) {

        var heading = document.getElementById("welcomeHeading");

        if (heading) {
            heading.innerText = "Welcome, " + userName.trim();
        }
    }
}



/* -----------------------------
   Load donor dashboard data
----------------------------- */

async function fetchDonorRecentActivity() {

    var donorId = localStorage.getItem("userId");

    var tableBody = document.querySelector(".donation-table tbody");

    tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading your dashboard...</td></tr>';

    try {

        console.log("Loading donor data for ID:", donorId);

        var response = await fetch(
            BACKEND_URL + "/api/donor/donations?donor_id=" + donorId
        );

        console.log("Server status:", response.status);


        if (response.ok) {

            var donations = await response.json();

            console.log("Fetched donations:", donations.length);


            /* -----------------------------
               Calculate statistics
            ----------------------------- */

            var pending = 0;
            var accepted = 0;
            var rejected = 0;
            var completed = 0;

            for (var i = 0; i < donations.length; i++) {

                var status = donations[i].status.toLowerCase();

                if (status === "pending") {
                    pending++;

                } else if (
                    status === "accepted" ||
                    status === "reached" ||
                    status === "picked"
                ) {
                    accepted++;

                } else if (status === "rejected") {
                    rejected++;

                } else if (status === "completed") {
                    completed++;
                }
            }


            // Update dashboard numbers
            document.querySelector(".pending-val").innerText = pending;
            document.querySelector(".accept-val").innerText = accepted;
            document.querySelector(".reject-val").innerText = rejected;
            document.querySelector(".total-val").innerText = completed;



            /* -----------------------------
               Show active donations
            ----------------------------- */

            tableBody.innerHTML = "";

            var shown = 0;

            for (var j = 0; j < donations.length; j++) {

                var item = donations[j];
                var status = item.status.toLowerCase();

                // Skip completed and rejected in the "Recent/Active" table
                if (status !== "completed" && status !== "rejected" && shown < 5) {

                    var row = document.createElement("tr");
                    row.style.cursor = "pointer";


                    // Click navigation
                    (function (id) {
                        row.onclick = function () {
                            window.location.href =
                                "Donation-tracking.html?id=" + id;
                        };
                    })(item.id);


                    var statusClass = status;

                    var catClass = "veg";
                    if (item.category === "non-veg") catClass = "non-veg";
                    else if (item.category === "both") catClass = "both";


                    row.innerHTML =
                        '<td style="font-weight:600;">' +
                        (item.trust_name || "Anonymous Trust") +
                        "</td>" +

                        '<td><span class="category-badge ' + catClass + '">' + (item.category || "veg") + '</span></td>' +

                        "<td>" + item.food_name + "</td>" +

                        '<td style="font-weight:500;">' +
                        item.approx_quantity +
                        "</td>" +

                        "<td>" + item.city + "</td>" +

                        '<td><span class="status ' +
                        statusClass +
                        '">' +
                        item.status +
                        "</span></td>";

                    tableBody.appendChild(row);

                    shown++;
                }
            }


            if (shown === 0) {
                tableBody.innerHTML =
                    '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">No active donations in progress.</td></tr>';
            }

        } else {
            console.error("Server error:", response.status);
            tableBody.innerHTML =
                '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Could not load dashboard data.</td></tr>';
        }

    } catch (error) {
        console.error("Connection error:", error);
        tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px;">Connection error. Is the server running?</td></tr>';
    }
}



/* -----------------------------
   Logout handler
----------------------------- */

document.addEventListener("click", function (event) {

    var text = event.target.innerText;

    if (!text) return;

    text = text.toLowerCase();

    if (text.includes("logout") || text.includes("log out")) {

        localStorage.clear();

        window.location.href = "../index.html";
    }
});
