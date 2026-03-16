import { BACKEND_URL } from "./api.js";

let currentRole = "donor";

window.switchRole = (role) => {
  currentRole = role;
  const donorFields = document.getElementById("donorFields");
  const trustFields = document.getElementById("trustFields");
  const donorBtn = document.getElementById("donorBtn");
  const trustBtn = document.getElementById("trustBtn");

  if (role === "donor") {
    donorFields.style.display = "grid";
    trustFields.style.display = "none";
    donorBtn.classList.add("active");
    trustBtn.classList.remove("active");
  } else {
    donorFields.style.display = "none";
    trustFields.style.display = "grid";
    trustBtn.classList.add("active");
    donorBtn.classList.remove("active");
  }
};

window.togglePassword = (inputId) => {
  const input = document.getElementById(inputId);
  const icon = event.currentTarget;
  input.type = input.type === "password" ? "text" : "password";
  icon.src =
    input.type === "text" ? "../assets/eye-on.png" : "../assets/eye-off.png";
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

window.handleSignup = async (event) => {
  event.preventDefault();
  const messageBox = document.getElementById("messageBox");
  const signupBtn = event.target.querySelector("button[type='submit']");

  signupBtn.disabled = true;
  signupBtn.classList.add("btn-loading");
  messageBox.innerText = "Creating your account...";
  messageBox.className = "form-message";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const mobile = document.getElementById("mobile").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (password !== confirmPassword) {
    messageBox.innerText = "Passwords do not match.";
    messageBox.className = "form-message error";
    signupBtn.disabled = false;
    signupBtn.classList.remove("btn-loading");
    return;
  }

  let signupData = {};
  let apiUrl = `${BACKEND_URL}/api/${currentRole}/signup`;

  try {
    if (currentRole === "donor") {
      const donorPhoto = document.getElementById("donorPhoto");
      let photoString = null;
      if (donorPhoto && donorPhoto.files[0]) {
        photoString = await getBase64(donorPhoto.files[0]);
      }
      signupData = {
        Firstname: document.getElementById("firstName").value,
        Lastname: document.getElementById("lastName").value,
        email,
        password,
        mobile_number: mobile,
        city,
        Pincode: pincode,
        photo: photoString,
      };
    } else {
      const trustPhoto = document.getElementById("trustPhoto");
      if (!trustPhoto || !trustPhoto.files[0]) {
        throw new Error("Please upload a trust verification photo.");
      }
      const photoString = await getBase64(trustPhoto.files[0]);
      signupData = {
        trust_name: document.getElementById("trustName").value,
        trust_address: document.getElementById("trustAddress").value,
        username: document.getElementById("username").value,
        license_number: document.getElementById("licenseNumber").value,
        email_id: email,
        password,
        mobile_number: mobile,
        city,
        pincode,
        trust_photo: photoString,
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();
    if (response.ok) {
      messageBox.innerText = "Registration successful! You can now log in.";
      messageBox.className = "form-message success";
      setTimeout(() => (window.location.href = "login.html"), 2000);
    } else {
      messageBox.innerText = `Registration failed: ${result.detail || "Please check your information."}`;
      messageBox.className = "form-message error";
      signupBtn.disabled = false;
      signupBtn.classList.remove("btn-loading");
    }
  } catch (error) {
    messageBox.innerText = error.message || "Error occurred. Please try again.";
    messageBox.className = "form-message error";
    signupBtn.disabled = false;
    signupBtn.classList.remove("btn-loading");
  }
};
