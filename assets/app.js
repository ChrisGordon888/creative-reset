/**
 * EmailJS integration plan:
 * 1) Create EmailJS account
 * 2) Add Email Service (Gmail)
 * 3) Create Email Template(s)
 * 4) Get your Public Key
 * 5) Replace the placeholders below
 *
 * We will send:
 * - Email to YOU (full submission)
 * - Email to CLIENT (confirmation)
 */

const EMAILJS_PUBLIC_KEY = "1W9hCtI-g2_AHgkjm";
const EMAILJS_SERVICE_ID = "service_pcftr5k";
const TEMPLATE_TO_YOU = "template_6wlzugs";
const TEMPLATE_TO_CLIENT = "template_tp6wn9n";

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load EmailJS"));
    document.head.appendChild(s);
  });
}

function setStatus(text) {
  const el = document.getElementById("statusText");
  if (el) el.textContent = text || "";
}

function disableSubmit(disabled) {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = !!disabled;
}

(async function init() {
  const form = document.getElementById("resetForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    disableSubmit(true);
    setStatus("Submitting…");

    // Collect form data
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      await loadEmailJs();
      // eslint-disable-next-line no-undef
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

      // 1) Send to you
      // eslint-disable-next-line no-undef
      await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_YOU, payload);

      // 2) Send confirmation to client
      // eslint-disable-next-line no-undef
      await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_CLIENT, payload);

      window.location.href = "thanks.html";
    } catch (err) {
      console.error(err);
      setStatus("Submission failed. Please try again, or email me directly.");
      disableSubmit(false);
    }
  });
})();