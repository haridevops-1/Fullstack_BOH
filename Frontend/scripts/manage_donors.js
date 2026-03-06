// Backend API URL
var BACKEND_URL = 'http://127.0.0.1:8000';

// Initialize donor list on page load
document.addEventListener('DOMContentLoaded', function () {
    // Start getting the list of all donors from our system
    fetchAllDonors();
});

// Fetch and display registered donors
async function fetchAllDonors() {
    // Get table container
    var tableBody = document.querySelector('tbody');

    // Display loading state
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading donors list...</td></tr>';

    try {
        // Retrieve donor data from the server
        var response = await fetch(BACKEND_URL + "/api/admin/all_donors");
        var donorsList = await response.json();

        // Clear the loading message
        tableBody.innerHTML = '';

        if (response.ok === true && donorsList.length > 0) {
            // Iterate through donor records and populate the table
            for (var i = 0; i < donorsList.length; i++) {
                var donor = donorsList[i];

                // Create a new table row element
                var row = document.createElement('tr');

                // Build the row content using simple string addition (+)
                // We show name, email, role, city, and a status
                row.innerHTML =
                    '<td>' +
                    '<strong>' + donor.Firstname + ' ' + (donor.Lastname || "") + '</strong><br />' +
                    '<small>' + donor.email + '</small>' +
                    '</td>' +
                    '<td>Donor</td>' +
                    '<td>' + donor.city + '</td>' +
                    '<td><span style="color: green; font-weight: 600;">Active</span></td>' +
                    '<td><button class="view-btn" id="viewBtn' + i + '" style="padding: 5px 10px; cursor: pointer;">View</button></td>';

                // Add the row to our table
                tableBody.appendChild(row);

                // Bind profile view functionality
                var btn = document.getElementById('viewBtn' + i);
                if (btn !== null) {
                    btn.onclick = function () {
                        alert('Full donor profile details will be available in the next update!');
                    };
                }
            }
        } else {
            // Display empty state message
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No donors found in the system.</td></tr>';
        }
    } catch (err) {
        // Handle connection or server errors
        console.log('Error:', err);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Error: Could not connect to server.</td></tr>';
    }
}
