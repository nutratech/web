<script>
  import { onMount } from "svelte";

  import { loadTurnstile } from "$lib/turnstile";
  import { browser } from "$app/environment";
  import { tick, onDestroy } from "svelte";

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const BYPASS_TOKEN = import.meta.env.VITE_CAPTCHA_BYPASS_TOKEN;

  let status = "Checking...";
  let isOperational = false;
  let homeserverConfig = "nutra.tk";

  /**
   * @typedef {Object} Check
   * @property {string} name
   * @property {string} status
   */

  /**
   * @typedef {Object} Results
   * @property {string|null} config
   * @property {string|null} version
   * @property {string|null} serverName
   * @property {string|null} auth
   * @property {string|null} registration
   * @property {string|null} welcome
   * @property {string|null} adminStatus
   * @property {Check[]} checks
   */

  /** @type {Results} */
  let results = {
    config: null,
    version: null,
    serverName: null,
    auth: null,
    registration: null,
    welcome: null,
    adminStatus: null,
    checks: [],
  };
  let errorMsg = "";

  onMount(async () => {
    try {
      // Check 1: Client Discovery
      addCheck("Service Discovery", "Pending");
      const wellKnownRes = await fetch(
        `https://${homeserverConfig}/.well-known/matrix/client`,
      );
      if (!wellKnownRes.ok)
        throw new Error("Failed to fetch .well-known configuration");

      const wellKnownData = await wellKnownRes.json();
      const baseUrl = wellKnownData["m.homeserver"]?.base_url;

      if (!baseUrl) throw new Error("Invalid configuration: Missing base_url");
      updateCheck("Service Discovery", true);
      results.config = baseUrl;

      // Check: Server Welcome Message (Embed) - now using confirmed baseUrl
      try {
        // baseUrl usually includes scheme (https://...)
        const welcomeRes = await fetch(`${baseUrl}/`);
        if (welcomeRes.ok) {
          const htmlText = await welcomeRes.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, "text/html");
          const panelContent = doc.querySelector(".panel")?.innerHTML;
          if (panelContent) {
            results.welcome = panelContent;
          }
        }
      } catch (e) {
        // Silence NS_ERROR_INTERCEPTION_FAILED (often caused by ad-blockers/extensions)
        // and other welcome fetch errors as this is non-critical.
        if (String(e).includes("NS_ERROR_INTERCEPTION_FAILED")) {
          // do nothing
        } else {
          console.warn("Could not fetch welcome message", e);
        }
      }

      // Check 2: API Connectivity & Version
      addCheck("Client API", "Pending");
      const versionRes = await fetch(`${baseUrl}/_matrix/client/versions`);
      if (!versionRes.ok) throw new Error("Failed to verify API connectivity");
      updateCheck("Client API", true);

      // Check 3: Server Implementation (Federation Version)
      addCheck("Federation API", "Pending");
      // Note: This endpoint is usually restricted, but we verified it has CORS enabled on this server.
      try {
        const fedRes = await fetch(`${baseUrl}/_matrix/federation/v1/version`);
        if (fedRes.ok) {
          const fedData = await fedRes.json();
          if (fedData.server) {
            results.version = `${fedData.server.name} ${fedData.server.version}`;
          }
        }
      } catch (ignore) {
        console.warn("Could not fetch federation version", ignore);
      }
      updateCheck("Federation API", !!results.version);

      // Check 4: Identity / Server Keys
      // Fetches the authoritative server_name
      addCheck("Server Key", "Pending");
      const keyRes = await fetch(`${baseUrl}/_matrix/key/v2/server`);
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        results.serverName = keyData.server_name;
        updateCheck("Server Key", true);
      } else {
        updateCheck("Server Key", false);
      }

      // Check 5: Authentication Support
      const loginRes = await fetch(`${baseUrl}/_matrix/client/v3/login`);
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        /** @type {string[]} */
        const flows = loginData.flows?.map(
          (/** @type {{type: string}} */ f) => {
            if (f.type === "m.login.password") return "Password";
            if (f.type === "m.login.token") return "Token";
            if (f.type === "m.login.sso") return "SSO";
            if (f.type === "m.login.application_service") return "App Service";
            return f.type;
          },
        );
        if (flows) results.auth = flows.join(", ");
      }

      // Check 6: Registration Status
      try {
        const regRes = await fetch(`${baseUrl}/_matrix/client/v3/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (regRes.status === 401) {
          // 401 + flows means registration is open but requires steps (captcha/token/dummy)
          results.registration = "Open";
          const regData = await regRes.json();

          if (regData.flows) {
            /** @type {string[]} */
            const modes = regData.flows.map(
              (/** @type {{stages: string[]}} */ flow) => {
                const stages = flow.stages || [];
                const requirements = [];

                if (stages.includes("m.login.registration_token"))
                  requirements.push("Token");
                if (stages.includes("m.login.recaptcha"))
                  requirements.push("Captcha");
                if (stages.includes("m.login.email.identity"))
                  requirements.push("Email");
                if (stages.includes("m.login.terms"))
                  requirements.push("Terms");
                if (stages.includes("m.login.dummy") && stages.length === 1)
                  return "Public";

                return requirements.length > 0
                  ? requirements.join(" + ")
                  : "Unknown";
              },
            );

            // unique modes only
            const uniqueModes = [...new Set(modes)];
            if (uniqueModes.length > 0) {
              results.registration += ` (${uniqueModes.join(" or ")})`;
            }
          }
        } else if (regRes.status === 403) {
          results.registration = "Closed";
        }
      } catch (ignore) {
        console.warn("Registration check failed", ignore);
      }

      // Server Status + Admin Presence (from backend)
      try {
        const infoRes = await fetch("/api/server-info");
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          results.adminStatus = infoData.admin_presence || "unknown"; // Default to unknown if missing key
        } else {
          results.adminStatus = "error"; // API reachable but returned error
        }
      } catch (e) {
        console.warn("Could not fetch server info/presence", e);
        results.adminStatus = "unavailable"; // Network error / API down
      }

      // Success state
      status = "Operational";
      isOperational = true;
    } catch (e) {
      console.error("Connection check failed:", e);
      status = "Error";
      isOperational = false;
      if (e instanceof Error) {
        errorMsg = e.message;
      } else {
        errorMsg = String(e);
      }
      if (results.checks.some((c) => c.status === "Pending")) {
        const pending = results.checks.find((c) => c.status === "Pending");
        if (pending) updateCheck(pending.name, false);
      }
    }
  });

  /**
   * @param {string} name
   * @param {string} status
   */
  function addCheck(name, status) {
    if (!results.checks.some((c) => c.name === name)) {
      results.checks = [...results.checks, { name, status }];
    }
  }

  /**
   * @param {string} name
   * @param {boolean} success
   */
  function updateCheck(name, success) {
    results.checks = results.checks.map((c) =>
      c.name === name ? { ...c, status: success ? "OK" : "Fail" } : c,
    );
  }

  // Shoutbox Logic
  let chatName = "";
  let chatMessage = "";
  let chatSending = false;
  let chatStatus = ""; // "success", "error", ""
  let chatStatusMsg = "";

  // Private Reply System
  /** @type {string|null} */
  let myEventId = null;
  /** @type {any} */
  let replyPollInterval = null;
  /** @type {Array<{sender: string, body: string, timestamp: number}>} */
  let replies = [];

  let showCaptcha = false;
  let isMockCaptcha = false;

  async function handleSend() {
    if (!chatMessage.trim()) return;
    if (showCaptcha) return; // Already dealing with captcha

    showCaptcha = true;
    chatStatus = "";

    if (BYPASS_TOKEN) {
      isMockCaptcha = true;
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
    const el = document.getElementById("cf-turnstile-chat");
    if (el && !el.hasChildNodes() && tInstance) {
      tInstance.render("#cf-turnstile-chat", {
        sitekey: SITE_KEY,
        callback: onChatTurnstileSuccess,
        "error-callback": () => {
          chatStatus = "error";
          chatStatusMsg = "Captcha load failed.";
          showCaptcha = false;
        },
      });
    }
  }

  function handleMockVerify() {
    // Simulate network delay
    setTimeout(() => {
      onChatTurnstileSuccess(BYPASS_TOKEN);
    }, 500);
  }

  /** @param {string} token */
  async function onChatTurnstileSuccess(token) {
    chatSending = true;
    try {
      const res = await fetch("/api/send-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: chatName || "Guest",
          message: chatMessage,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        chatStatus = "success";
        chatStatusMsg = "Message sent! Waiting for replies...";
        chatMessage = ""; // Clear message
        showCaptcha = false; // Reset captcha flow

        // Start polling for replies
        if (data.event_id) {
          myEventId = data.event_id;
          replies = []; // Clear old replies
          startPolling();
        }
      } else {
        chatStatus = "error";
        chatStatusMsg = data.error || "Failed to send.";
        // Keep captcha open? Usually token is one-time use.
        // We probably need to reset captcha to try again, but let's hide it for retry.
        showCaptcha = false;
      }
    } catch (e) {
      chatStatus = "error";
      chatStatusMsg = "Network error.";
      showCaptcha = false;
    } finally {
      chatSending = false;
    }
  }

  function startPolling() {
    stopPolling();
    // Poll every 5 seconds
    replyPollInterval = setInterval(checkReplies, 5000);
  }

  function stopPolling() {
    if (replyPollInterval) {
      clearInterval(replyPollInterval);
      replyPollInterval = null;
    }
  }

  async function checkReplies() {
    if (!myEventId) return;
    try {
      const res = await fetch("/api/check-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_event_id: myEventId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.replies && data.replies.length > 0) {
          // Update replies if changed (simple replace for now)
          replies = data.replies;
        }
      }
    } catch (e) {
      console.error("Polling error", e);
    }
  }

  onDestroy(() => {
    stopPolling();
  });
</script>

<svelte:head>
  <title>Chat | Nutratech</title>
</svelte:head>

<section class="chat-page">
  <div class="panel shoutbox-panel">
    <h2>Public Shoutbox</h2>
    <p class="subtitle">Send a quick message to the public room.</p>

    {#if results.adminStatus}
      <div class="admin-presence-badge">
        <span class="label">Admin:</span>
        <code class="status-indicator {results.adminStatus}">
          <span class="dot"></span>
          {#if results.adminStatus === "unknown"}
            Unknown
          {:else if results.adminStatus === "error" || results.adminStatus === "unavailable"}
            Error
          {:else}
            {results.adminStatus}
          {/if}
        </code>
      </div>
    {/if}

    <div class="chat-form">
      <div class="form-group">
        <input
          type="text"
          placeholder="Name or title (Optional)"
          bind:value={chatName}
          disabled={chatSending || showCaptcha}
        />
      </div>
      <div class="form-group">
        <textarea
          placeholder="Message..."
          bind:value={chatMessage}
          rows="3"
          disabled={chatSending || showCaptcha}
        ></textarea>
      </div>

      {#if !showCaptcha && !chatSending}
        <button
          class="btn-send"
          on:click={handleSend}
          disabled={!chatMessage.trim()}
        >
          Send Message
        </button>
      {:else}
        {#if isMockCaptcha}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="mock-captcha"
            on:click={handleMockVerify}
            role="button"
            tabindex="0"
          >
            <div class="mock-checkbox"></div>
            <span>I am not a robot (Dev Mock)</span>
          </div>
        {:else}
          <div id="cf-turnstile-chat" class="captcha-container"></div>
        {/if}

        {#if chatSending}
          <p class="sending-indicator">Sending...</p>
        {/if}
      {/if}

      {#if chatStatus}
        <p class="status-msg {chatStatus}">{chatStatusMsg}</p>
      {/if}

      {#if replies.length > 0}
        <div class="replies-section">
          <h3>Replies</h3>
          <div class="replies-list">
            {#each replies as reply}
              <div class="reply-item">
                <span class="sender"
                  >{reply.sender.replace("@", "").split(":")[0]}</span
                >
                <p>{@html reply.body}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="panel">
    <div class="server-info">
      <div class="detailed-checks">
        <div class="status-header">
          <h3
            class:status-ok={isOperational}
            class:status-error={!isOperational && status !== "Checking..."}
          >
            {status === "Checking..."
              ? "Connecting..."
              : isOperational
                ? "System Operational"
                : "Connection Error"}
          </h3>
        </div>

        {#if results.config}
          <div class="report-summary">
            <div class="summary-item">
              <span class="label">Host</span>
              <code>{results.config.replace("https://", "")}</code>
            </div>
            {#if results.serverName}
              <div class="summary-item">
                <span class="label">Server Name (Homeserver)</span>
                <code>{results.serverName}</code>
              </div>
            {/if}
            {#if results.version}
              <div class="summary-item">
                <span class="label">Version</span>
                <code>{results.version}</code>
              </div>
            {/if}
            {#if results.auth}
              <div class="summary-item">
                <span class="label">Authentication</span>
                <code>{results.auth}</code>
              </div>
            {/if}
            {#if results.registration}
              <div class="summary-item">
                <span class="label">Registration</span>
                <code>{results.registration}</code>
              </div>
            {/if}
          </div>
        {/if}

        <div class="check-grid">
          {#each results.checks as check}
            <div class="check-item">
              <span class="label">{check.name}</span>
              <span
                class="value status-icon {check.status === 'OK'
                  ? 'ok'
                  : check.status === 'Fail'
                    ? 'fail'
                    : 'pending'}"
              >
                {check.status === "OK"
                  ? "✓"
                  : check.status === "Fail"
                    ? "✗"
                    : "..."}
              </span>
            </div>
          {/each}
        </div>
      </div>

      {#if errorMsg}
        <p class="error-msg">{errorMsg}</p>
      {/if}
    </div>

    {#if results.welcome}
      <div class="welcome-embed">
        {@html results.welcome}
      </div>
    {/if}
  </div>
</section>

<style>
  .chat-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: grid;
    place-items: center;
    min-height: 60vh;
  }

  .panel {
    background: var(--bg-card);
    padding: 2.5rem;
    border-radius: 15px;
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    text-align: center;
  }

  .welcome-embed {
    margin-bottom: 1rem;
    text-align: left;
    padding-top: 2rem;
    margin-top: 1rem;
    border-top: 1px dashed var(--color-border);
  }

  /* Make sure embedded links look good */
  :global(.welcome-embed a) {
    color: var(--color-primary);
    text-decoration: none;
  }
  :global(.welcome-embed a:hover) {
    text-decoration: underline;
  }
  :global(.welcome-embed h1) {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  :global(.welcome-embed ul) {
    margin-left: 1.5rem;
    margin-top: 1rem;
  }
  :global(.welcome-embed li) {
    margin-bottom: 0.5rem;
  }

  .server-info {
    text-align: left;
  }

  .server-info h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  /* Detailed Breakdown Styles */
  .detailed-checks {
    margin-top: 0.5rem;
  }

  .status-header h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .report-summary {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    text-align: left;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-item .label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .summary-item code {
    font-size: 0.95rem;
    background: transparent;
    padding: 0;
    color: var(--color-text);
    text-align: left;
  }

  .check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .check-item {
    background: var(--color-bg);
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--color-border);
  }

  .check-item .label {
    color: var(--text-muted);
  }

  .check-item .value {
    font-weight: bold;
    font-family: var(--font-mono);
  }

  .status-icon.ok {
    color: #4ade80;
  }
  .status-icon.fail {
    color: #f87171;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: capitalize;
  }
  .status-indicator .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
  }
  .status-indicator.online .dot {
    background: #4ade80;
  }
  .status-indicator.unavailable .dot {
    background: #fbbf24;
  }
  .status-indicator.offline .dot {
    background: #9ca3af;
  }
  .status-indicator.unknown .dot {
    background: #9ca3af; /* Grey for unknown */
    opacity: 0.5;
  }
  .status-indicator.error .dot,
  .status-indicator.unavailable .dot {
    background: #f87171; /* Red for service error */
  }

  .error-msg {
    color: #f87171;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  /* Shoutbox Styles */
  .shoutbox-panel {
    margin-bottom: 2rem;
  }
  .shoutbox-panel h2 {
    margin-bottom: 0.5rem;
  }
  .subtitle {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .admin-presence-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-bg);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }
  .admin-presence-badge .label {
    font-weight: bold;
    color: var(--text-muted);
  }
  .chat-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: inherit;
  }
  .form-group textarea {
    resize: vertical;
  }
  .btn-send {
    background: var(--color-primary, #007bff);
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-send:hover:not(:disabled) {
    background: var(--color-primary-dark, #0056b3);
  }
  .btn-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .status-msg {
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  .status-msg.success {
    color: #4ade80;
  }
  .status-msg.error {
    color: #f87171;
  }

  .captcha-container {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
    min-height: 65px;
  }

  .mock-captcha {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 1rem;
    width: 300px;
    margin: 1rem auto;
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

  .replies-section {
    margin-top: 2rem;
    text-align: left;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }
  .replies-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }
  .reply-item {
    background: var(--color-bg-secondary, #f9f9f9);
    padding: 0.8rem;
    border-radius: 6px;
    margin-bottom: 0.8rem;
    border-left: 3px solid var(--color-primary);
  }
  .reply-item .sender {
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--color-primary);
    display: block;
    margin-bottom: 0.3rem;
  }
  .reply-item p {
    margin: 0;
    font-size: 0.95rem;
  }
</style>
