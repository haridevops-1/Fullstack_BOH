/**
 * This is a simple function to log out of the application.
 * It clears all saved user data and takes the user back to the home page.
 */
function logout() {
    // Clear everything we saved in browser memory (userId, userRole, etc.)
    localStorage.clear();

    // Redirect the user to the starting page
    // We use ../ to go back one folder from the 'pages' directory
    window.location.href = "../index.html";
}

/* -----------------------------
   Global Server Health Check
----------------------------- */

// Check every 15 seconds to see if server is still connected
setInterval(function () {
    // Only check if a user is currently logged in
    var userId = localStorage.getItem("userId");
    if (!userId) return;

    // We use AbortController to stop waiting after 10 seconds
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
        controller.abort();
    }, 10000); // 10 seconds limit

    // Try to ping the backend
    fetch("http://127.0.0.1:8000", { signal: controller.signal })
        .then(function (response) {
            // If we got a response, clear the timer (Server is UP)
            clearTimeout(timeoutId);
        })
        .catch(function (error) {
            // If it takes more than 10s or server is down
            alert("Lost connection to server for more than 10 seconds. You will be logged out for security.");
            logout();
        });
}, 15000);

