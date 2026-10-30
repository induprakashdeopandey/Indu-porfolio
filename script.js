const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "✕" : "☰";
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) menuButton.textContent = "☰";
  });
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(contactForm).entries());
  const apiUrl = window.PORTFOLIO_API_URL;
  if (!apiUrl || apiUrl.includes("YOUR_BACKEND_URL")) {
    formStatus.textContent = "The contact service is not connected yet. Please email me directly for now.";
    return;
  }
  submitButton.disabled = true;
  formStatus.textContent = "Sending your message…";
  try {
    const response = await fetch(apiUrl.replace(/\/$/, "") + "/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Unable to send your message.");
    contactForm.reset();
    formStatus.textContent = "Thanks! Your message has been saved successfully.";
  } catch (error) {
    formStatus.textContent = error.message || "Something went wrong. Please try again later.";
  } finally {
    submitButton.disabled = false;
  }
});
