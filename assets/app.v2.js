/**
 * Production EmailJS submit handler
 * Sends:
 * 1) Admin email to Chris (full submission)
 * 2) Client confirmation email (short confirmation)
 *
 * EmailJS templates must use:
 *  - To Email: {{to_email}}
 *  - Reply-to: {{reply_to}}
 */

const EMAILJS_PUBLIC_KEY = "1W9hCtI-g2_AHgkjm";
const EMAILJS_SERVICE_ID = "service_pcftr5k";
const TEMPLATE_TO_YOU = "template_6wlzugs";
const TEMPLATE_TO_CLIENT = "template_tp6wn9n";

const ADMIN_EMAIL = "chris.c.gordon888@gmail.com";

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.async = true;
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

    setStatus("Submitting…");
    disableSubmit(true);

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      await loadEmailJs();
      // eslint-disable-next-line no-undef
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

      // 1) Admin email (full submission) -> you
      // eslint-disable-next-line no-undef
      await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_YOU, {
        ...payload,
        to_email: ADMIN_EMAIL,
        reply_to: payload.email || ADMIN_EMAIL,
      });

      // 2) Client confirmation -> client
      // eslint-disable-next-line no-undef
      await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_CLIENT, {
        ...payload,
        to_email: payload.email,
        reply_to: ADMIN_EMAIL,
      });

      window.location.href = "thanks.html";
    } catch (err) {
      console.error("EmailJS error:", err);
      const status = err?.status ? ` (${err.status})` : "";
      const text = err?.text || err?.message || "Please try again.";
      setStatus(`Submission failed${status}: ${text}`);
      disableSubmit(false);
    }
  });
})();