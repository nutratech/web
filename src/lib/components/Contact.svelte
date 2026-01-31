<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { loadTurnstile } from "$lib/turnstile";

  import { tick } from "svelte";
  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  // Security: Only allow bypass in development mode
  const BYPASS_TOKEN = import.meta.env.DEV
    ? import.meta.env.VITE_CAPTCHA_BYPASS_TOKEN
    : null;

  /**
   * @typedef {Object} Turnstile
   * @property {function(string, Object): void} render
   */

  let token = "";
  /** @type {{ email: string; matrix: string; gpg_description: string; gpg_public_key: string } | null} */
  let contactData = null;
  let error = "";
  let loading = false;
  let showCaptcha = false;
  let copyMessage = "";

  async function startVerification() {
    if (showCaptcha || contactData) return;
    showCaptcha = true;
    error = "";

    if (BYPASS_TOKEN) {
      // Use mock flow
      return;
    }

    if (browser) {
      const _t = await loadTurnstile();
      if (_t) {
        // Wait for DOM to update with the container
        await tick();
        const win = /** @type {Window & { turnstile?: any }} */ (window);
        win.turnstile = _t;
        renderCaptcha(_t);
      }
    }
  }

  /**
   * @param {Turnstile} tInstance
   */
  function renderCaptcha(tInstance) {
    // Check if element exists and not already rendered
    const el = document.getElementById("cf-turnstile-contact");
    if (el && !el.hasChildNodes() && tInstance) {
      tInstance.render("#cf-turnstile-contact", {
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

  function handleMockVerify() {
    // Simulate delay
    setTimeout(() => {
      onTurnstileSuccess(BYPASS_TOKEN);
    }, 500);
  }

  function copyGpg() {
    if (!contactData) return;
    const lines = contactData.gpg_public_key.trim().split("\n").length;
    navigator.clipboard.writeText(contactData.gpg_public_key);
    copyMessage = `✓ Copied ${lines} lines to clipboard`;
    setTimeout(() => {
      copyMessage = "";
    }, 2000);
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
        <button
          class="btn-copy"
          on:click={copyGpg}
          title="Click to copy full key"
        >
          {#if copyMessage}
            {copyMessage}
          {:else}
            📋 Copy Full Public Key Block
          {/if}
        </button>
      </div>
    </div>
  {:else}
    {#if !showCaptcha}
      <p>Please verify you are human to see contact details.</p>
      <button class="btn-verify" on:click={startVerification}
        >View Contact Details</button
      >
    {:else}
      <!-- Explicit Render Container -->
      {#if BYPASS_TOKEN}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="mock-captcha"
          on:click={handleMockVerify}
          role="button"
          tabindex="0"
        >
          <div class="mock-checkbox"></div>
          <span>Verify Contact (Dev Mock)</span>
        </div>
      {:else}
        <div id="cf-turnstile-contact"></div>
        <p class="instruction">Completing verification...</p>
      {/if}
    {/if}
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

  .btn-copy {
    background: var(--color-code-bg, #f8f9fa);
    border: 1px solid var(--color-border, #ddd);
    color: var(--color-text, inherit);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    width: 100%;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-copy:hover {
    background: var(--color-bg-hover, rgba(0, 0, 0, 0.05));
    border-color: var(--color-border-hover, #ccc);
  }

  .btn-verify {
    background: var(--color-primary, #007bff);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-verify:hover {
    background: var(--color-primary-dark, #0056b3);
  }

  .instruction {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--color-text-light, #666);
  }

  /* Mock Styles */
  .mock-captcha {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 0.8rem;
    width: 100%;
    max-width: 300px;
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    color: #333;
  }
  .mock-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid #999;
    border-radius: 2px;
    background: white;
  }
  .mock-captcha:active .mock-checkbox {
    background: #ccc;
  }
</style>
