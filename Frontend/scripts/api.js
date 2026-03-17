export const BACKEND_URL = "https://bridge-of-hope-backend-r53q.vercel.app";
export const CLOUDINARY_CLOUD_NAME = "dqqjyumh8";
export const CLOUDINARY_API_KEY = "156294232916679";

export function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export function logout() {
  localStorage.clear();
  window.location.href = "../index.html";
}

export function formatDate(dateString) {
  if (!dateString) return "No Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Redirect if not logged in or if role is wrong
export function checkAuth(role) {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("authToken");

  // If there is no user ID or token, or the role doesn't match
  if (!userId || !token || (role && userRole !== role)) {
    // We just send them to the login page without a popup alert
    window.location.href = "login.html";
    return false;
  }
  return true;
}
