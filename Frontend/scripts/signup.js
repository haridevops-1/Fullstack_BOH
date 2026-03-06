// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Current signup role
var currentRole = "donor";

/* -------------------------
   Switch Signup Role
------------------------- */

function switchRole(role) {
  currentRole = role;

  var donorFields = document.getElementById("donorFields");
  var trustFields = document.getElementById("trustFields");

  var donorBtn = document.getElementById("donorBtn");
  var trustBtn = document.getElementById("trustBtn");

  if (role === "donor") {
    if (donorFields) donorFields.style.display = "grid";
    if (trustFields) trustFields.style.display = "none";

    if (donorBtn) donorBtn.classList.add("active");
    if (trustBtn) trustBtn.classList.remove("active");
  } else {
    if (donorFields) donorFields.style.display = "none";
    if (trustFields) trustFields.style.display = "grid";

    if (trustBtn) trustBtn.classList.add("active");
    if (donorBtn) donorBtn.classList.remove("active");
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
    block: "center",
  });
}

/* -------------------------
   Toggle password visibility
------------------------- */

function togglePassword(inputId) {
  var input = document.getElementById(inputId);

  var icon = event.currentTarget;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../assets/eye-on.png";
  } else {
    input.type = "password";
    icon.src = "../assets/eye-off.png";
  }
}

/* -------------------------
   Convert image to Base64
------------------------- */

function getBase64(file) {
  return new Promise(function (resolve, reject) {
    var status = document.getElementById("uploadStatus");

    if (status) status.style.display = "block";

    var reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function () {
      if (status) status.style.display = "none";

      resolve(reader.result);
    };

    reader.onerror = function (error) {
      if (status) status.style.display = "none";

      reject(error);
    };
  });
}

/* -------------------------
   Signup Handler
------------------------- */

async function handleSignup(event) {
  event.preventDefault();

  var messageBox = document.getElementById("messageBox");

  if (messageBox) messageBox.className = "form-message";

  var signupBtn = event.target.querySelector("button[type='submit']");

  if (!signupBtn) return;

  // Get input values
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  var mobile = document.getElementById("mobile").value.trim();
  var city = document.getElementById("city").value.trim();
  var pincode = document.getElementById("pincode").value.trim();

  /* -------------------------
       Validation
    ------------------------- */

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showMessage("Please enter a valid email!", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters!", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match!", "error");
    return;
  }

  if (mobile.length !== 10 || isNaN(mobile)) {
    showMessage("Mobile must be exactly 10 digits!", "error");
    return;
  }

  /* -------------------------
       Prepare API data
    ------------------------- */

  var apiUrl = "";
  var signupData = {};

  var donorPhoto = document.getElementById("donorPhoto");
  var trustPhoto = document.getElementById("trustPhoto");

  var photoString = null;

  signupBtn.classList.add("btn-loading");
  signupBtn.disabled = true;

  try {
    if (currentRole === "donor") {
      apiUrl = BACKEND_URL + "/api/donor/signup";

      if (donorPhoto && donorPhoto.files[0]) {
        if (donorPhoto.files[0].size > 2 * 1024 * 1024) {
          showMessage("Image must be smaller than 2MB", "error");

          signupBtn.classList.remove("btn-loading");
          signupBtn.disabled = false;

          return;
        }

        photoString = await getBase64(donorPhoto.files[0]);
      }

      signupData = {
        Firstname: document.getElementById("firstName").value,
        Lastname: document.getElementById("lastName").value,
        email: email,
        password: password,
        mobile_number: mobile,
        city: city,
        Pincode: pincode,
        photo: photoString,
      };
    } else {
      apiUrl = BACKEND_URL + "/api/trust/signup";

      if (!trustPhoto || !trustPhoto.files[0]) {
        showMessage("Trust verification image required!", "error");

        signupBtn.classList.remove("btn-loading");
        signupBtn.disabled = false;

        return;
      }

      if (trustPhoto.files[0].size > 2 * 1024 * 1024) {
        showMessage("Image must be smaller than 2MB", "error");

        signupBtn.classList.remove("btn-loading");
        signupBtn.disabled = false;

        return;
      }

      photoString = await getBase64(trustPhoto.files[0]);

      signupData = {
        trust_name: document.getElementById("trustName").value,
        trust_address: document.getElementById("trustAddress").value,
        username: document.getElementById("username").value,
        license_number: document.getElementById("licenseNumber").value,
        email_id: email,
        password: password,
        mobile_number: mobile,
        city: city,
        pincode: pincode,
        trust_photo: photoString,
      };
    }

    /* -------------------------
           Send request
        ------------------------- */

    var response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });

    var result = await response.json();

    if (response.ok) {
      showMessage("Registration successful! Redirecting...", "success");

      setTimeout(function () {
        window.location.href = "login.html";
      }, 2000);
    } else {
      showMessage(
        "Signup failed: " + (result.detail || "Something went wrong"),
        "error",
      );

      signupBtn.classList.remove("btn-loading");
      signupBtn.disabled = false;
    }
  } catch (error) {
    showMessage("Server error. Check if backend is running.", "error");

    signupBtn.classList.remove("btn-loading");
    signupBtn.disabled = false;
  }
}
