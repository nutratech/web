<script>
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import { loadTurnstile } from "$lib/turnstile";

  /** @type {(token: string) => Promise<void>} */
  export let onVerify; // Callback (token) => Promise<void>
  export let action = "access content"; // "view contact details", "enter chat", etc.

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const BYPASS_TOKEN = import.meta.env.VITE_CAPTCHA_BYPASS_TOKEN;

  let showCaptcha = false;
  let error = "";
  let loading = false;
  let verified = false;

  async function startVerification() {
    if (showCaptcha) return;
    showCaptcha = true;
    error = "";

    if (BYPASS_TOKEN) {
      // Dev Mock
      return;
    }

    if (browser) {
      const _t = await loadTurnstile();
      if (_t) {
        await tick();
        const win = /** @type {Window & { turnstile?: any }} */ (window);
        win.turnstile = _t;
        renderCaptcha(_t);
      }
    }
  }

  /** @param {any} tInstance */
  function renderCaptcha(tInstance) {
    const el = document.getElementById("cf-turnstile-protection");
    if (el && !el.hasChildNodes() && tInstance) {
      tInstance.render("#cf-turnstile-protection", {
        sitekey: SITE_KEY,
        callback: handleSuccess,
        "error-callback": () => {
          error = "Captcha failed to load.";
        },
      });
    }
  }

  /** @param {string} token */
  async function handleSuccess(token) {
    loading = true;
    try {
      await onVerify(token);
      verified = true;
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "Verification failed.";
      }
      // Reset captcha?
    } finally {
      loading = false;
    }
  }

  function handleMockVerify() {
    setTimeout(() => {
      handleSuccess(BYPASS_TOKEN);
    }, 500);
  }
</script>

<div class="protection-container">
  {#if !verified}
    <div class="gate">
      <h2>Security Check</h2>
      <p>Please verify you are human to {action}.</p>

      {#if !showCaptcha}
        <button class="btn-verify" on:click={startVerification}>Verify</button>
      {:else if BYPASS_TOKEN}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="mock-captcha"
          on:click={handleMockVerify}
          role="button"
          tabindex="0"
        >
          <div class="mock-checkbox"></div>
          <span>Verify (Dev Mock)</span>
        </div>
      {:else}
        <div id="cf-turnstile-protection"></div>
        <p class="instruction">Verifying...</p>
      {/if}

      {#if error}
        <p class="error">{error}</p>
      {/if}
      {#if loading}
        <p class="loading">Loading content...</p>
      {/if}
    </div>
  {:else}
    <slot />
  {/if}
</div>

<style>
  .protection-container {
    width: 100%;
  }
  .gate {
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border, #ddd);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    margin: 2rem auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  h2 {
    margin-bottom: 1rem;
  }
  p {
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
  }

  .btn-verify {
    background: var(--color-primary, #007bff);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  .btn-verify:hover {
    background: var(--color-primary-dark, #0056b3);
  }
  .error {
    color: #dc2626;
    margin-top: 1rem;
  }
  .loading {
    color: #2563eb;
    margin-top: 1rem;
  }

  /* Mock Styles */
  .mock-captcha {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 0.8rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    max-width: 250px;
  }
  .mock-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid #999;
    background: white;
  }
</style>
