import { BACKEND_URL } from './api.js';

let currentRole = "donor";

// Expose functions to window because they are used in HTML attributes
window.switchRole = (role) => {
    currentRole = role;
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
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
    const messageBox = document.getElementById("messageBox");
    const loginBtn = event.target.querySelector("button[type='submit']");

    loginBtn.disabled = true;
    loginBtn.classList.add("btn-loading");
    messageBox.innerText = "Verifying your credentials, please wait...";
    messageBox.className = "form-message";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    let endpoint = `${BACKEND_URL}/api/${currentRole}/login`;
    let payload = { email, password };

    // Trust login uses email_id instead of email
    if (currentRole === "trust") {
        payload = { email_id: email, password };
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.innerText = "Success! Welcome back to Bridge of Hope.";
            messageBox.className = "form-message success";

            localStorage.setItem("userId", data.id);
            localStorage.setItem("userRole", currentRole);
            localStorage.setItem("userName", data.name || "User");
            localStorage.setItem("authToken", data.access_token);
            if (data.city) localStorage.setItem("userCity", data.city);

            setTimeout(() => {
                const pages = { donor: "Donor_dashboard.html", trust: "Trust_dashboard.html", admin: "admin_dashboard.html" };
                window.location.href = pages[currentRole];
            }, 1000);
        } else {
            messageBox.innerText = data.detail || "Oops! The email or password you entered is incorrect. Please try again.";
            messageBox.className = "form-message error";
            loginBtn.disabled = false;
            loginBtn.classList.remove("btn-loading");
        }
    } catch (error) {
        messageBox.innerText = "Unable to connect to the server. Please check your internet connection or try again later.";
        messageBox.className = "form-message error";
        loginBtn.disabled = false;
        loginBtn.classList.remove("btn-loading");
    }
};
