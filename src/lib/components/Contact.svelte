<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  let token = "";
  /** @type {{ email: string; matrix: string; gpg: string } | null} */
  let contactData = null;
  let error = "";
  let loading = false;

  onMount(() => {
    if (browser) {
      if (window.turnstile) {
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
    if (el && !el.hasChildNodes()) {
      window.turnstile.render("#cf-turnstile-contact", {
        sitekey: SITE_KEY,
        callback: onTurnstileSuccess,
        "error-callback": () => {
          error = "Captcha failed to load. This is expected on localhost.";
        },
      });
    }
  }

  // Turnstile Callback
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
      <div class="item">
        <span class="label">GPG:</span>
        <pre>{contactData.gpg}</pre>
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
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .item {
    margin-bottom: 0.5rem;
  }
  .label {
    font-weight: bold;
    margin-right: 0.5rem;
    color: #aaa;
  }
  pre {
    background: #111;
    padding: 0.5rem;
    overflow-x: auto;
  }
  .error {
    color: #ff5555;
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
