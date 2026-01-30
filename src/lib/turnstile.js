import { browser } from '$app/environment';

/**
 * Loads the Cloudflare Turnstile script dynamically.
 * @returns {Promise<any>} A promise that resolves with the turnstile object when loaded.
 */
export function loadTurnstile() {
    if (!browser) return Promise.resolve(null);

    return new Promise((resolve) => {
        if (window.turnstile) {
            resolve(window.turnstile);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => {
                resolve(window.turnstile);
            });
            return;
        }

        const script = document.createElement('script');
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            resolve(window.turnstile);
        };
        document.head.appendChild(script);
    });
}
