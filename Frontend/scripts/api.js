// Choose the correct backend URL automatically based on whether we are local or deployed
const PROD_URL = "https://bridge-of-hope-backend-r53q.vercel.app";
const LOCAL_URL = "http://localhost:8000";

export const BACKEND_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    ? LOCAL_URL 
    : PROD_URL;
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

export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "🔔";
  if (type === "success") icon = "✅";
  else if (type === "error") icon = "❌";
  else if (type === "warning") icon = "⚠️";

  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Expose these to window so they can be called from HTML onclick attributes
window.logout = logout;
window.showToast = showToast;
