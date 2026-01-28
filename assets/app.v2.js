/**
 * EmailJS integration (debuggable)
 *
 * Fixes:
 * - Sends admin email -> you (template 1)
 * - Sends client confirmation -> client (template 2)
 * - Stores debug logs in sessionStorage so redirect won't wipe them
 * - Only redirects AFTER both sends succeed
 *
 * IMPORTANT (EmailJS templates):
 * In BOTH templates set:
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

function logPersist(line) {
  const key = "focus_reset_debug_logs";
  const existing = sessionStorage.getItem(key);
  const next = (existing ? existing + "\n" : "") + line;
  sessionStorage.setItem(key, next);
  console.log(line);
}

function clearLogs() {
  sessionStorage.removeItem("focus_reset_debug_logs");
}

(async function init() {
  const form = document.getElementById("resetForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearLogs();

    setStatus("");
    disableSubmit(true);
    setStatus("Submitting…");

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    logPersist(`TEMPLATE_TO_YOU=${TEMPLATE_TO_YOU}`);
    logPersist(`TEMPLATE_TO_CLIENT=${TEMPLATE_TO_CLIENT}`);
    logPersist(`payload.email=${payload.email || "(missing)"}`);

    try {
      await loadEmailJs();
      // eslint-disable-next-line no-undef
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      logPersist("EmailJS loaded + initialized ✅");

      // 1) Admin email (full submission)
      setStatus("Sending admin email…");

      const adminParams = {
        ...payload,
        to_email: ADMIN_EMAIL,
        reply_to: payload.email || ADMIN_EMAIL,
      };

      // eslint-disable-next-line no-undef
      const r1 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_YOU, adminParams);
      logPersist(`Admin send OK: status=${r1.status} text=${r1.text}`);

      // 2) Client confirmation
      setStatus("Sending confirmation email…");

      const clientParams = {
        ...payload,
        to_email: payload.email,
        reply_to: ADMIN_EMAIL,
      };

      // eslint-disable-next-line no-undef
      const r2 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_CLIENT, clientParams);
      logPersist(`Client send OK: status=${r2.status} text=${r2.text}`);

      setStatus("Success ✅ Redirecting…");
      window.location.href = "thanks.html";
    } catch (err) {
      console.error("EmailJS error:", err);

      // EmailJS often returns {status, text}
      const status = err && err.status ? `status=${err.status}` : "";
      const text = err && err.text ? `text=${err.text}` : (err && err.message ? err.message : "");
      logPersist(`ERROR ${status} ${text}`);

      setStatus(`Submission failed. ${status} ${text}`.trim());
      disableSubmit(false);
    }
  });
})();