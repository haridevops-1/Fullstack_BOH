// Backend API URL
var BACKEND_URL = "http://127.0.0.1:8000";

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("Trust list page loaded");

  loadTrustList();

  setupLogout();
});

/* -----------------------------
   Logout setup
----------------------------- */

function setupLogout() {
  var links = document.querySelectorAll("a");

  for (var i = 0; i < links.length; i++) {
    var text = links[i].innerText.toLowerCase();

    if (text.includes("log out")) {
      links[i].onclick = function (e) {
        e.preventDefault();

        localStorage.clear();

        window.location.href = "../index.html";
      };
    }
  }
}

/* -----------------------------
   Load trust list
----------------------------- */

async function loadTrustList() {
  var container = document.querySelector(".all-container");

  if (!container) return;

  // Loading message
  container.innerHTML =
    '<div style="text-align:center;padding:40px;width:100%;grid-column:1/-1;">Finding nearby trust organizations...</div>';

  // Show donor city in heading
  var donorCity = localStorage.getItem("userCity") || "Chennai";

  var heading = document.querySelector(".main-headings h2");

  if (heading) {
    heading.innerText = "Find Trusts in " + donorCity;
  }

  try {
    var response = await fetch(BACKEND_URL + "/api/donor/all_trusts");

    if (response.ok) {
      var trusts = await response.json();

      container.innerHTML = "";

      var count = 0;

      for (var i = 0; i < trusts.length; i++) {
        var item = trusts[i];

        var card = document.createElement("div");

        card.className = "trust-card";

        card.innerHTML =
          '<div class="image-wrapper">' +
          '<img src="' +
          (item.trust_photo ||
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop") +
          '">' +
          '<div class="verified-badge">✔ Verified</div>' +
          "</div>" +
          '<div class="details">' +
          '<div class="trust-name">' +
          (item.trust_name || "Verified Trust") +
          "</div>" +
          '<div class="info-group">' +
          '<div class="info-item"><span class="label">Mobile</span><span class="value">' +
          (item.mobile_number || "Contact Admin") +
          "</span></div>" +
          '<div class="info-item"><span class="label">Address</span><span class="value">' +
          (item.trust_address || "Not specified") +
          "</span></div>" +
          '<div class="info-item"><span class="label">City</span><span class="value">' +
          (item.city || "Not specified") +
          "</span></div>" +
          '<div class="info-item"><span class="label">Pincode</span><span class="value">' +
          (item.pincode || "---") +
          "</span></div>" +
          "</div>" +
          '<button class="donate-btn-large">Donate Now</button>' +
          "</div>";

        // Donate button click
        (function (id, name) {
          var btn = card.querySelector("button");

          if (btn) {
            btn.onclick = function () {
              window.location.href =
                "create_donation.html?trustId=" +
                id +
                "&trustName=" +
                encodeURIComponent(name);
            };
          }
        })(item.id, item.trust_name);

        container.appendChild(card);

        count++;
      }

      if (count === 0) {
        container.innerHTML =
          '<div style="text-align:center;color:grey;width:100%;grid-column:1/-1;padding:60px;">No trust organizations found.</div>';
      }
    } else {
      container.innerHTML =
        '<div style="text-align:center;color:red;width:100%;grid-column:1/-1;padding:40px;">Server error. Could not fetch trusts.</div>';
    }
  } catch (error) {
    console.log("Connection error:", error);

    container.innerHTML =
      '<div style="text-align:center;color:red;width:100%;grid-column:1/-1;padding:40px;">Connection error. Backend may be offline.</div>';
  }
}
