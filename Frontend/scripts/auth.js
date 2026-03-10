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



