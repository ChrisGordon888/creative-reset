/**
 * EmailJS integration (GitHub Pages friendly)
 *
 * This version:
 * - Forces correct recipients using `to_email` (admin) and `to_email` (client)
 * - Uses `reply_to` so replies go to the right person
 * - Adds console logging for deterministic debugging
 *
 * IMPORTANT: Update BOTH EmailJS templates:
 *  - To Email: {{to_email}}
 *  - Reply-to: {{reply_to}}
 */

const EMAILJS_PUBLIC_KEY = "1W9hCtI-g2_AHgkjm";
const EMAILJS_SERVICE_ID = "service_pcftr5k";
const TEMPLATE_TO_YOU = "template_6wlzugs";
const TEMPLATE_TO_CLIENT = "template_tp6wn9n";

// Change if you want admin emails routed elsewhere
const ADMIN_EMAIL = "chris.c.gordon888@gmail.com";

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    // Avoid double-injecting the script if the page is reloaded quickly
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

function safeLog(label, value) {
  try {
    // Keep logs readable; don’t dump huge objects accidentally
    console.log(label, value);
  } catch (_) {
    // no-op
  }
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

    // Debug logs (requested)
    safeLog("Using TEMPLATE_TO_YOU:", TEMPLATE_TO_YOU);
    safeLog("Using TEMPLATE_TO_CLIENT:", TEMPLATE_TO_CLIENT);
    safeLog("Payload email:", payload.email);

    try {
      await loadEmailJs();
      // eslint-disable-next-line no-undef
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

      // 1) Admin email (full submission) -> ALWAYS to you
      const adminParams = {
        ...payload,
        to_email: ADMIN_EMAIL,
        reply_to: payload.email || ADMIN_EMAIL,
      };

      // eslint-disable-next-line no-undef
      const r1 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_YOU, adminParams);
      safeLog("Sent admin template result:", r1);

      // 2) Client confirmation -> ALWAYS to client
      const clientParams = {
        ...payload,
        to_email: payload.email,
        reply_to: ADMIN_EMAIL,
      };

      // eslint-disable-next-line no-undef
      const r2 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_CLIENT, clientParams);
      safeLog("Sent client template result:", r2);

      window.location.href = "thanks.html";
    } catch (err) {
      console.error("EmailJS error:", err);

      // If EmailJS provides a response body, surface it
      const msg =
        (err && err.text) ||
        (err && err.message) ||
        "Submission failed. Please try again, or email me directly.";

      setStatus(msg);
      disableSubmit(false);
    }
  });
})();