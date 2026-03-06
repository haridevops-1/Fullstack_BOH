// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Current login role
var currentRole = "donor";


/* -------------------------
   Switch login role
------------------------- */

function switchRole(role) {

    currentRole = role;

    var donorBtn = document.getElementById("donorBtn");
    var trustBtn = document.getElementById("trustBtn");
    var adminBtn = document.getElementById("adminBtn");

    // Remove active class from all
    if (donorBtn) donorBtn.classList.remove("active");
    if (trustBtn) trustBtn.classList.remove("active");
    if (adminBtn) adminBtn.classList.remove("active");

    // Activate selected role
    if (role === "donor" && donorBtn) donorBtn.classList.add("active");
    if (role === "trust" && trustBtn) trustBtn.classList.add("active");
    if (role === "admin" && adminBtn) adminBtn.classList.add("active");

    // Change email label
    var label = document.querySelector(".label-1");

    if (label) {
        if (role === "admin") {
            label.innerText = "Admin Email";
        } else {
            label.innerText = "Email";
        }
    }
}



/* -------------------------
   Show message on page
------------------------- */

function showMessage(text, type) {

    var box = document.getElementById("messageBox");

    if (!box) return;

    box.innerText = text;

    box.className = "form-message " + type;

    box.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}



/* -------------------------
   Show / Hide password
------------------------- */

function togglePassword(inputId) {

    var passwordInput = document.getElementById(inputId);

    var icon = event.currentTarget;

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        icon.src = "../assets/eye-on.png";

    } else {

        passwordInput.type = "password";
        icon.src = "../assets/eye-off.png";
    }
}



/* -------------------------
   Login handler
------------------------- */

async function handleLogin(event) {

    event.preventDefault();

    var messageBox = document.getElementById("messageBox");

    if (messageBox) messageBox.className = "form-message";

    var loginBtn = event.target.querySelector("button[type='submit']");

    if (!loginBtn) return;

    loginBtn.classList.add("btn-loading");
    loginBtn.disabled = true;


    // Get form values
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;


    /* -------------------------
       Choose API endpoint
    ------------------------- */

    var endpoint = "";
    var payload = {};

    if (currentRole === "donor") {

        endpoint = BACKEND_URL + "/api/donor/login";
        payload = { email: email, password: password };

    } else if (currentRole === "trust") {

        endpoint = BACKEND_URL + "/api/trust/login";
        payload = { email_id: email, password: password };

    } else if (currentRole === "admin") {

        endpoint = BACKEND_URL + "/api/admin/login";
        payload = { email: email, password: password };
    }


    if (!endpoint) {

        showMessage("Please select a login type.", "error");

        loginBtn.classList.remove("btn-loading");
        loginBtn.disabled = false;

        return;
    }


    console.log("Trying login for role:", currentRole);


    try {

        var response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        var data = await response.json();


        if (response.ok) {

            showMessage("Login successful! Welcome.", "success");


            // Save user info
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userRole", currentRole);
            localStorage.setItem("userName", data.name || "User");

            if (data.city) {
                localStorage.setItem("userCity", data.city);
            }


            // Redirect based on role
            setTimeout(function () {

                if (currentRole === "donor") {
                    window.location.href = "Donor_dashboard.html";
                }

                else if (currentRole === "trust") {
                    window.location.href = "Trust_dashboard.html";
                }

                else if (currentRole === "admin") {
                    window.location.href = "admin_dashboard.html";
                }

            }, 1000);

        } else {

            showMessage(
                "Login failed: " + (data.detail || "Invalid credentials"),
                "error"
            );

            loginBtn.classList.remove("btn-loading");
            loginBtn.disabled = false;
        }

    } catch (error) {

        console.log("Server error:", error);

        showMessage(
            "Server error. Check if backend is running.",
            "error"
        );

        loginBtn.classList.remove("btn-loading");
        loginBtn.disabled = false;
    }
}