(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submitBtn");
  const hiddenFields = {
    country: document.getElementById("country"),
    city: document.getElementById("city"),
    region: document.getElementById("region"),
    timestamp: document.getElementById("timestamp"),
    pageSource: document.getElementById("page_source"),
  };

  if (hiddenFields.pageSource) {
    hiddenFields.pageSource.value = window.location.href;
  }

  async function fetchLocation() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (hiddenFields.country) hiddenFields.country.value = data.country_name || "Unknown";
      if (hiddenFields.city) hiddenFields.city.value = data.city || "Unknown";
      if (hiddenFields.region) hiddenFields.region.value = data.region || "Unknown";
    } catch (err) {
      if (hiddenFields.country) hiddenFields.country.value = "Unknown";
      if (hiddenFields.city) hiddenFields.city.value = "Unknown";
      if (hiddenFields.region) hiddenFields.region.value = "Unknown";
      console.warn("Location lookup failed", err);
    }
  }

  fetchLocation();

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("text-green-600", "text-red-600");
    if (type === "success") statusEl.classList.add("text-green-600");
    if (type === "error") statusEl.classList.add("text-red-600");
  }

  function validateForm() {
    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const service = form.elements["service"].value.trim();
    const phone = form.elements["phone"].value.trim();

    if (name.length < 2) return { valid: false, message: "Please enter your full name." };
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) return { valid: false, message: "Enter a valid email address." };
    if (!service) return { valid: false, message: "Select the service you're interested in." };
    if (phone && phone.replace(/\D/g, "").length < 6) {
      return { valid: false, message: "Phone number looks too short." };
    }
    return { valid: true };
  }

  async function submitLead(event) {
    event.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      setStatus("error", validation.message);
      return;
    }

    if (hiddenFields.timestamp) hiddenFields.timestamp.value = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    setStatus("info", "Sending your details...");

    const formData = new FormData(form);
    formData.append("form_origin", "website");

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: formData,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result || result.status !== "success") {
        throw new Error(result && result.msg ? result.msg : "Unable to submit form.");
      }

      if (window.dataLayer) {
        window.dataLayer.push({
          event: "contact_form_success",
          service: form.elements["service"].value,
        });
      }

      setStatus("success", "Submitted successfully! Redirecting...");
      form.reset();

      setTimeout(() => {
        window.location.href = "/thank-you.html";
      }, 800);
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error", error.message || "Something went wrong. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  }

  form.addEventListener("submit", submitLead);
})();


