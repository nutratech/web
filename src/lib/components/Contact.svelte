<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  /**
   * @typedef {Object} Turnstile
   * @property {function(string, Object): void} render
   */

  /** @type {Turnstile | undefined} */
  const turnstile = /** @type {any} */ (window).turnstile;

  let token = "";
  /** @type {{ email: string; matrix: string; gpg_description: string; gpg_public_key: string } | null} */
  let contactData = null;
  let error = "";
  let loading = false;

  onMount(() => {
    if (browser) {
      if (turnstile) {
        renderCaptcha();
      } else {
        // Retry if script hasn't loaded yet
        setTimeout(renderCaptcha, 1000);
      }
    }
  });

  function renderCaptcha() {
    // Check if element exists and not already rendered
    const el = document.getElementById("cf-turnstile-contact");
    if (el && !el.hasChildNodes() && turnstile) {
      turnstile.render("#cf-turnstile-contact", {
        sitekey: SITE_KEY,
        callback: onTurnstileSuccess,
        "error-callback": () => {
          error = "Captcha failed to load. This is expected on localhost.";
        },
      });
    }
  }

  // Turnstile Callback
  /**
   * @param {string} t
   */
  async function onTurnstileSuccess(t) {
    token = t;
    loading = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        contactData = await res.json();
      } else {
        error = "Validation failed. Please try again.";
      }
    } catch (e) {
      error = "Network error.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="contact-section">
  <h2>Contact</h2>

  {#if contactData}
    <div class="secrets fade-in">
      <div class="item">
        <span class="label">Email:</span>
        <a href="mailto:{contactData.email}">{contactData.email}</a>
      </div>
      <div class="item">
        <span class="label">Matrix:</span>
        <code>{contactData.matrix}</code>
      </div>
      <div class="item gpg-section">
        <span class="label">GPG Key Info:</span>
        <pre class="gpg-block">{contactData.gpg_description}</pre>
      </div>
      <div class="item gpg-section">
        <span class="label">Public Key:</span>
        <pre class="gpg-block">{contactData.gpg_public_key}</pre>
      </div>
    </div>
  {:else}
    <p>Please verify you are human to see contact details.</p>
    <!-- Explicit Render Container -->
    <div id="cf-turnstile-contact"></div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .contact-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: var(--color-bg-card, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }
  .item {
    margin-bottom: 0.5rem;
  }
  .label {
    font-weight: bold;
    margin-right: 0.5rem;
    color: var(--color-text-muted);
  }
  pre {
    background: var(--color-code-bg);
    padding: 0.5rem;
    overflow-x: auto;
    color: var(--color-text);
  }
  .gpg-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .gpg-block {
    text-align: left;
    font-size: 0.75rem;
    white-space: pre;
    margin: 0.5rem 0 0 0;
    width: 100%;
  }
  .error {
    color: var(--color-danger, #ef4444);
  }
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
