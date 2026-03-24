import { BACKEND_URL, getAuthHeaders, checkAuth, logout } from "./api.js";

// This function runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is a logged-in donor
  if (checkAuth("donor") === true) {
    loadTrustList();
  }

  // Make the logout function available to the window
  window.logout = logout;
});

// This function fetches all trusts and displays them in cards
async function loadTrustList() {
  const container = document.querySelector(".all-container");

  // If no container found, stop
  if (!container) {
    return;
  }

  // Show a "Finding" message while we wait for the server
  container.innerHTML = '<div style="text-align:center;padding:40px;width:100%;grid-column:1/-1;">Finding trusts in your area...</div>';

  // Get the city from local storage to show in the heading
  const userCity = localStorage.getItem("userCity") || "your area";
  const sectionHeading = document.querySelector(".main-headings h2");
  if (sectionHeading) {
    sectionHeading.innerText = "Find Trusts in " + userCity;
  }

  try {
    // Call the API to get all trusts
    const response = await fetch(BACKEND_URL + "/api/donor/all_trusts", {
      headers: getAuthHeaders(),
    });

    if (response.ok === true) {
      const trustsArray = await response.json();

      // Clear the loading message
      container.innerHTML = "";

      // If no trusts found
      if (trustsArray.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:grey;width:100%;grid-column:1/-1;padding:60px;">No trusts found.</div>';
      } else {
        // FILTERING LOGIC: Only show trusts that match the donor's city
        // Note: We do a case-insensitive check to be safe
        const filteredTrusts = trustsArray.filter(t => {
          if (!userCity || userCity === "your area") return true;
          return t.city.toLowerCase().trim() === userCity.toLowerCase().trim();
        });

        if (filteredTrusts.length === 0) {
          container.innerHTML = '<div style="text-align:center;color:grey;width:100%;grid-column:1/-1;padding:60px;">No trusts found in ' + userCity + '.</div>';
        } else {
          // Loop through each FILTERED trust and create a card
          for (let i = 0; i < filteredTrusts.length; i++) {
            const trustItem = filteredTrusts[i];
            const card = document.createElement("div");
            card.className = "premium-card";

            // Use a default image if the trust doesn't have one
            const trustPhoto = trustItem.trust_photo || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop";

            // CLEAN CITY NAME: Handle typos like 'cxHENNAI'
            let rawCity = trustItem.city || "Not specified";
            let cleanCity = rawCity.replace(/^cx/i, "").trim();
            // Capitalize first letter
            cleanCity = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1).toLowerCase();

            // Build the card HTML
            card.innerHTML =
              '<div class="image-wrapper">' +
              '<img src="' + trustPhoto + '">' +
              '<div class="verified-badge">✓ Verified</div>' +
              '</div>' +
              '<div class="details">' +
              '<div class="trust-name">' + (trustItem.trust_name || "Verified Trust") + '</div>' +
              '<div class="info-group">' +
              '<div class="info-item"><span class="label">Mobile</span><span class="value">' + (trustItem.mobile_number || "Contact Admin") + '</span></div>' +
              '<div class="info-item"><span class="label">Address</span><span class="value">' + (trustItem.trust_address || "Not specified") + '</span></div>' +
              '<div class="info-item"><span class="label">City</span><span class="value">' + cleanCity + '</span></div>' +
              '</div>' +
              '<button class="donate-btn-large">Donate Now</button>' +
              '</div>';

            // Set up the "Donate Now" button click event
            const donateBtn = card.querySelector("button");
            donateBtn.onclick = function () {
              const safeTrustName = encodeURIComponent(trustItem.trust_name);
              window.location.href = "create_donation.html?trustId=" + trustItem.id + "&trustName=" + safeTrustName;
            };

            container.appendChild(card);
          }
        }
      }
    }
  } catch (error) {
    container.innerHTML = '<div style="text-align:center;color:red;width:100%;grid-column:1/-1;padding:40px;">Connection error. Please check your internet.</div>';
  }
}
