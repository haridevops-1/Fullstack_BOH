import { BACKEND_URL } from "./api.js";

let currentRole = "donor";

// Expose functions to window because they are used in HTML attributes
window.switchRole = (role) => {
  currentRole = role;
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`${role}Btn`).classList.add("active");

  const label = document.querySelector(".label-1");
  if (label) {
    label.innerText = role === "admin" ? "Admin Email" : "Email";
  }
};

window.togglePassword = (inputId) => {
  const input = document.getElementById(inputId);
  const icon = event.currentTarget;
  if (input.type === "password") {
    input.type = "text";
    icon.src = "../assets/eye-on.png";
  } else {
    input.type = "password";
    icon.src = "../assets/eye-off.png";
  }
};

window.handleLogin = async (event) => {
  event.preventDefault();
  
  // 1. Get the elements we need
  const messageBox = document.getElementById("messageBox");
  const loginForm = event.target;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  // 2. Simple Validation: Check if fields are empty
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (email === "" || password === "") {
    messageBox.innerText = "Error: Please enter both email and password.";
    messageBox.className = "form-message error";
    return; // Stop here if fields are empty
  }

  // 3. Prepare for login - clear any old session data first
  // This helps prevent "Access Denied" issues when switching between donor and trust
  localStorage.clear();

  loginBtn.disabled = true;
  loginBtn.classList.add("btn-loading");
  messageBox.innerText = "Checking your details...";
  messageBox.className = "form-message";

  let endpoint = BACKEND_URL + "/api/" + currentRole + "/login";
  let payload = { email, password };

  // Note: Trust login usually uses 'email_id' instead of 'email' in the backend
  if (currentRole === "trust") {
    payload = { email_id: email, password: password };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok === true) {
      messageBox.innerText = "Login successful! Redirecting...";
      messageBox.className = "form-message success";

      // Save user info to the browser's storage
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userRole", currentRole);
      localStorage.setItem("userName", data.name || "User");
      localStorage.setItem("authToken", data.access_token);
      if (data.city) {
        localStorage.setItem("userCity", data.city);
      }

      // Wait 1 second then go to the dashboard
      setTimeout(function () {
        if (currentRole === "donor") {
          window.location.href = "Donor_dashboard.html";
        } else if (currentRole === "trust") {
          window.location.href = "Trust_dashboard.html";
        } else if (currentRole === "admin") {
          window.location.href = "admin_dashboard.html";
        }
      }, 1000);
      
    } else {
      // Show the exact error message from the server
      messageBox.innerText = "Login failed: " + (data.detail || "Invalid email or password.");
      messageBox.className = "form-message error";
      loginBtn.disabled = false;
      loginBtn.classList.remove("btn-loading");
    }
  } catch (error) {
    messageBox.innerText = "Connection error. Please try again.";
    messageBox.className = "form-message error";
    loginBtn.disabled = false;
    loginBtn.classList.remove("btn-loading");
  }
};
