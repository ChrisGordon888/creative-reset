/**
 * Debug-first EmailJS sender:
 * - Shows logs on the index page (so they can't vanish)
 * - Stores logs in localStorage (survives refresh/navigation)
 * - Does NOT redirect to thanks.html (until we confirm both sends work)
 *
 * Templates MUST have:
 *   To Email: {{to_email}}
 *   Reply To: {{reply_to}}
 */

const EMAILJS_PUBLIC_KEY = "1W9hCtI-g2_AHgkjm";
const EMAILJS_SERVICE_ID = "service_pcftr5k";
const TEMPLATE_TO_YOU = "template_6wlzugs";
const TEMPLATE_TO_CLIENT = "template_tp6wn9n";

const ADMIN_EMAIL = "chris.c.gordon888@gmail.com";
const LOG_KEY = "focus_reset_debug_logs_v2";

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load EmailJS script"));
    document.head.appendChild(s);
  });
}

function appendLog(line) {
  const existing = localStorage.getItem(LOG_KEY) || "";
  const next = (existing ? existing + "\n" : "") + line;
  localStorage.setItem(LOG_KEY, next);

  const pre = document.getElementById("statusText");
  if (pre) pre.textContent = next;
  console.log(line);
}

function clearLogs() {
  localStorage.removeItem(LOG_KEY);
  const pre = document.getElementById("statusText");
  if (pre) pre.textContent = "";
}

function disableSubmit(disabled) {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = !!disabled;
}

(async function init() {
  const form = document.getElementById("resetForm");
  if (!form) return;

  // Render any previous logs (helps if you reload)
  const existing = localStorage.getItem(LOG_KEY);
  if (existing) {
    const pre = document.getElementById("statusText");
    if (pre) pre.textContent = existing;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearLogs();
    disableSubmit(true);

    appendLog("=== SUBMIT START ===");
    appendLog(`TEMPLATE_TO_YOU=${TEMPLATE_TO_YOU}`);
    appendLog(`TEMPLATE_TO_CLIENT=${TEMPLATE_TO_CLIENT}`);

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    appendLog(`payload.email=${payload.email || "(missing)"}`);

    try {
      await loadEmailJs();
      // eslint-disable-next-line no-undef
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      appendLog("EmailJS loaded + initialized ✅");

      // Admin send
      const adminParams = {
        ...payload,
        to_email: ADMIN_EMAIL,
        reply_to: payload.email || ADMIN_EMAIL,
      };

      appendLog("Sending ADMIN email…");
      // eslint-disable-next-line no-undef
      const r1 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_YOU, adminParams);
      appendLog(`ADMIN OK: status=${r1.status} text=${r1.text}`);

      // Client send
      const clientParams = {
        ...payload,
        to_email: payload.email,
        reply_to: ADMIN_EMAIL,
      };

      appendLog("Sending CLIENT confirmation…");
      // eslint-disable-next-line no-undef
      const r2 = await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_TO_CLIENT, clientParams);
      appendLog(`CLIENT OK: status=${r2.status} text=${r2.text}`);

      appendLog("=== BOTH SENDS SUCCESS ✅ ===");
      disableSubmit(false);

      // No redirect during debug.
      // Re-enable later:
      // window.location.href = "thanks.html";
    } catch (err) {
      const status = err?.status ? `status=${err.status}` : "";
      const text = err?.text || err?.message || "(no error text)";
      appendLog(`ERROR ${status} ${text}`);
      disableSubmit(false);
    }
  });
})();