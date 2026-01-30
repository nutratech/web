import { browser } from "$app/environment";

/**
 * @typedef {Object} Turnstile
 * @property {function(string, Object): void} render
 */

/**
 * Loads the Cloudflare Turnstile script dynamically.
 * @returns {Promise<Turnstile | null>} A promise that resolves with the turnstile object when loaded.
 */
export function loadTurnstile() {
  if (!browser) return Promise.resolve(null);

  return new Promise((resolve) => {
    const win = /** @type {Window & { turnstile?: Turnstile }} */ (window);

    if (win.turnstile) {
      resolve(win.turnstile);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(win.turnstile || null);
      });
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(win.turnstile || null);
    };
    document.head.appendChild(script);
  });
}
