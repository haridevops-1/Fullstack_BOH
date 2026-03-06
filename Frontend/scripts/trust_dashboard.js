// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";


// Run when page loads
document.addEventListener("DOMContentLoaded", function () {

    var userId = localStorage.getItem("userId");
    var role = localStorage.getItem("userRole");

    // Check login
    if (!userId || role !== "trust") {
        alert("Your login expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    // Show welcome message
    var name = localStorage.getItem("userName");
    var heading = document.getElementById("welcomeHeading");

    if (heading && name) {
        heading.innerText = "Welcome, " + name;
    }

    // Load dashboard data
    fetchTrustStats();
    loadRecentDonations(true); // Pass true to initialize 'seen' donations

    // Refresh button
    var refreshBtn = document.querySelector(".refresh-btn");

    if (refreshBtn) {
        refreshBtn.onclick = function () {
            console.log("Refreshing dashboard...");
            fetchTrustStats();
            loadRecentDonations(false);
        };
    }

    // Start polling for new donations every 10 seconds
    setInterval(function () {
        console.log("Checking for new donations...");
        fetchTrustStats();
        loadRecentDonations(false);
    }, 10000);

});

// Track seen donation IDs to detect new ones
var seenDonationIds = new Set();
var isFirstLoad = true;


/* -----------------------------
   Load dashboard statistics
----------------------------- */

async function fetchTrustStats() {

    var trustId = localStorage.getItem("userId");

    try {

        var response = await fetch(
            BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId
        );

        if (response.ok) {

            var list = await response.json();

            var pending = 0;
            var accepted = 0;
            var rejected = 0;
            var completed = 0;


            for (var i = 0; i < list.length; i++) {

                var status = list[i].status.toLowerCase();

                if (status === "pending") pending++;

                else if (
                    status === "accepted" ||
                    status === "reached" ||
                    status === "picked"
                ) accepted++;

                else if (status === "rejected") rejected++;

                else if (status === "completed") completed++;
            }


            // Update UI numbers
            var pendingEl = document.querySelector(".pending");
            var acceptEl = document.querySelector(".accept");
            var rejectEl = document.querySelector(".reject");
            var compEl = document.querySelector(".completed-count");

            if (pendingEl) pendingEl.innerText = pending;
            if (acceptEl) acceptEl.innerText = accepted;
            if (rejectEl) rejectEl.innerText = rejected;
            if (compEl) compEl.innerText = completed;


            // Hide / show footer text
            var footer = document.querySelector(".card-footer-text");

            if (footer) {
                footer.style.display = pending > 0 ? "none" : "block";
            }
        }

    } catch (error) {

        console.log("Error loading stats:", error);
    }
}



/* -----------------------------
   Load active donations
----------------------------- */

async function loadRecentDonations(init = false) {

    var trustId = localStorage.getItem("userId");

    var tableBody = document.querySelector("tbody");

    if (init) {
        tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;">Looking for active requests...</td></tr>';
    }

    try {

        var response = await fetch(
            BACKEND_URL + "/api/trust/donations_details?trust_id=" + trustId
        );

        if (response.ok) {

            var donations = await response.json();

            // Check for new donations
            donations.forEach(function (item) {
                var status = item.status.toLowerCase();
                // Only toast for NEW pending donations
                if (status === "pending" && !seenDonationIds.has(item.id)) {
                    if (!init && !isFirstLoad) {
                        showToast("🔔 New Incoming Donation: " + (item.food_name || "Food Request"));
                    }
                    seenDonationIds.add(item.id);
                } else if (!seenDonationIds.has(item.id)) {
                    // Mark as seen anyway so we don't toast later if status changes
                    seenDonationIds.add(item.id);
                }
            });

            isFirstLoad = false;

            tableBody.innerHTML = "";

            var count = 0;


            for (var i = 0; i < donations.length; i++) {

                var item = donations[i];

                var status = item.status.toLowerCase();


                // Skip finished or rejected
                if (status !== "completed" && status !== "rejected") {

                    var row = document.createElement("tr");


                    // Row click navigation
                    (function (id, stat) {

                        row.onclick = function () {

                            if (stat === "pending") {
                                window.location.href =
                                    "Trust_decision.html?id=" + id;
                            } else {
                                window.location.href =
                                    "Trust_update.html?id=" + id;
                            }

                        };

                    })(item.id, status);



                    var newBadge = "";
                    if (status === "pending") {
                        newBadge = '<span class="new-badge">NEW</span>';
                    }

                    var categoryClass = "veg";
                    if (item.category === "non-veg") categoryClass = "non-veg";
                    else if (item.category === "both") categoryClass = "both";

                    row.innerHTML =
                        "<td>" + (item.name || "Anonymous donor") + newBadge + "</td>" +

                        "<td>" + item.food_name + "</td>" +

                        '<td><span class="category-badge ' + categoryClass + '">' + (item.category || "veg") + "</span></td>" +

                        "<td>" + item.approx_quantity + "</td>" +

                        "<td>" + item.city + "</td>" +

                        '<td><span class="status ' +
                        status +
                        '">' +
                        item.status +
                        "</span></td>";


                    tableBody.appendChild(row);

                    count++;
                }
            }


            if (count === 0) {

                tableBody.innerHTML =
                    '<tr><td colspan="6" style="text-align:center;padding:40px;font-style:italic;">No active donation requests found.</td></tr>';
            }

        } else {

            tableBody.innerHTML =
                '<tr><td colspan="6" style="text-align:center;color:red;">Error: Could not load data.</td></tr>';
        }

    } catch (error) {

        console.log("Error:", error);

        tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;color:red;">Connection error. Backend is offline.</td></tr>';
    }
}


/* -----------------------------
   Toast Notification Logic
----------------------------- */

function showToast(message) {
    var container = document.getElementById("toast-container");
    if (!container) return;

    var toast = document.createElement("div");
    toast.className = "toast incoming";

    toast.innerHTML =
        '<span class="toast-icon">🎁</span>' +
        '<span class="toast-message">' + message + '</span>';

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(function () {
        toast.style.animation = "fadeOut 0.5s ease-out forwards";
        setTimeout(function () {
            toast.remove();
        }, 500);
    }, 5000);
}



/* -----------------------------
   Logout handler
----------------------------- */

document.addEventListener("click", function (event) {

    var text = event.target.innerText;

    if (!text) return;

    if (text.toLowerCase().includes("logout")) {

        localStorage.clear();

        window.location.href = "../index.html";
    }

});