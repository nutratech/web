<script>
  import { onMount } from "svelte";

  export let buttonText = "View Resume";
  /** @type {string | null} */
  let turnstileToken = null;
  let showCaptcha = false;
  let error = "";

  // Turnstile callback
  /**
   * @param {string} t
   */
  async function onTurnstileSuccess(t) {
    turnstileToken = t;
    await fetchResume();
  }

  /** @type {string | null} */
  let pdfUrl = null;

  async function fetchResume() {
    error = "";
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load resume");
      }

      // Create object URL for embedding
      const blob = await res.blob();
      pdfUrl = window.URL.createObjectURL(blob);

      // Reset captcha state
      showCaptcha = false;
    } catch (e) {
      console.error(e);
      // @ts-ignore
      error = e.message;
    }
  }

  function downloadPdf() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function startDownload() {
    error = "";
    showCaptcha = true;
    // Short delay to ensure DOM update before rendering widget
    setTimeout(() => {
      // @ts-ignore
      if (window.turnstile) {
        // @ts-ignore
        window.turnstile.render("#turnstile-widget-resume", {
          // @ts-ignore
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: onTurnstileSuccess,
        });
      }
    }, 50);
  }
</script>

<div class="resume-download">
  {#if pdfUrl}
    <div class="pdf-container">
      <iframe src={pdfUrl} title="Resume" height="900px"></iframe>
      <button class="btn-download" on:click={downloadPdf}>Download PDF</button>
    </div>
  {:else if !showCaptcha}
    <button class="btn-download" on:click={startDownload}>
      {buttonText}
    </button>
  {:else}
    <div class="captcha-container">
      <div id="turnstile-widget-resume"></div>
      <p class="instruction">Please verify to view resume.</p>
    </div>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .resume-download {
    width: 100%;
  }

  .pdf-container {
    width: calc(100vw - 300px);
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pdf-container iframe {
    width: 100%;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 8px;
  }

  .btn-download {
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

  .btn-download:hover {
    background: var(--color-primary-dark, #0056b3);
  }

  .captcha-container {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--color-bg-secondary, #f8f9fa);
    border-radius: 4px;
    border: 1px solid var(--color-border, #ddd);
  }

  .instruction {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: var(--color-text-light, #666);
  }

  .error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>
