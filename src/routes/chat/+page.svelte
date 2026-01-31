<script>
  import { onMount, tick, onDestroy } from "svelte";
  import TurnstileProtection from "$lib/components/TurnstileProtection.svelte";
  import { loadTurnstile } from "$lib/turnstile";
  import { browser } from "$app/environment";
  import { serverInfo } from "$lib/stores";

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  // Security: Only allow bypass in development mode
  const BYPASS_TOKEN = import.meta.env.DEV
    ? import.meta.env.VITE_CAPTCHA_BYPASS_TOKEN
    : null;

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

  async function loadServerInfo() {
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

      // Check: Server Welcome Message (Embed)
      try {
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

      // Fetch Server Info (Authenticated)
      const infoRes = await fetch(`/api/server-info`);

      if (infoRes.ok) {
        const info = await infoRes.json();
        // Update admin status etc if needed
        // $serverInfo.adminStatus = info.admin_presence; // Assuming store update
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
  }

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

    {#if $serverInfo.adminStatus}
      <div class="admin-presence-badge">
        <span class="label">Admin:</span>
        <code class="status-indicator {$serverInfo.adminStatus}">
          <span class="dot"></span>
          {#if $serverInfo.adminStatus === "unknown"}
            Unknown
          {:else if $serverInfo.adminStatus === "error" || $serverInfo.adminStatus === "unavailable"}
            Error
          {:else}
            {$serverInfo.adminStatus}
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
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .panel {
    background: var(--color-bg-card, #1e293b);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .shoutbox-panel {
    border-left: 4px solid var(--color-primary, #3b82f6);
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--color-text-muted);
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    font-family: inherit;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .btn-send {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-send:hover {
    background: var(--color-primary-dark, #2563eb);
  }

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .server-info h3 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }

  .status-ok {
    color: #22c55e;
  }
  .status-error {
    color: #ef4444;
  }

  .report-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .check-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-bg-secondary, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .check-item:hover {
    background: var(--color-bg-hover, rgba(255, 255, 255, 0.05));
    border-color: var(--color-primary-muted, rgba(59, 130, 246, 0.3));
    transform: translateY(-1px);
  }

  .status-icon {
    font-weight: bold;
  }
  .ok {
    color: #22c55e;
  }
  .fail {
    color: #ef4444;
  }
  .pending {
    color: var(--color-text-muted);
  }

  .welcome-embed {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  /* Captcha & Mock */
  .mock-captcha {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f9f9f9;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    color: #333;
    max-width: 300px;
  }
  .mock-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid #999;
    border-radius: 2px;
    background: white;
  }

  .replies-section {
    margin-top: 2rem;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }
  .reply-item {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    border-radius: 4px;
    border-left: 3px solid var(--color-primary);
  }
  .sender {
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--color-primary);
    display: block;
    margin-bottom: 0.3rem;
  }

  .admin-presence-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
    text-transform: capitalize;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
  }
  .online .dot {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  }
  .offline .dot {
    background: #ef4444;
  }
  .unavailable .dot {
    background: #f59e0b;
  }
  .error .dot {
    background: #ef4444;
  }
</style>
