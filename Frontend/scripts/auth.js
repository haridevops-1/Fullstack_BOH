// This function clears all stored user data and redirects to the home page
export function logout() {
  // localStorage is a place in the browser where we save data (like tokens and user IDs)
  localStorage.clear();

  // Go back to the main landing page
  window.location.href = "../index.html";
}

// This function creates the 'Headers' needed for secure API calls
export function getAuthHeaders() {
  // Retrieve the security token we saved during login
  const token = localStorage.getItem("authToken");

  // If we have a token, we format it as a "Bearer" token
  let authString = "";
  if (token) {
    authString = "Bearer " + token;
  }

  // Return the headers object that fetch() expects
  return {
    "Content-Type": "application/json",
    Authorization: authString,
  };
}

// Global exposure for HTML event handlers
window.logout = logout;
window.getAuthHeaders = getAuthHeaders;
