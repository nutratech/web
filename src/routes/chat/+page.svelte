<script>
  import { onMount } from "svelte";

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
</script>

<svelte:head>
  <title>Chat | Nutratech</title>
</svelte:head>

<section class="chat-page">
  <div class="panel">
    {#if results.welcome}
      <div class="welcome-embed">
        {@html results.welcome}
      </div>
    {/if}

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
                <span class="label">Server Name</span>
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
    margin-bottom: 2rem;
    text-align: left;
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
    padding-top: 1.5rem;
    border-top: 1px dashed var(--color-border);
  }

  .server-info h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  /* Detailed Breakdown Styles */
  .detailed-checks {
    margin-top: 1rem;
  }

  .status-header h3 {
    text-align: center;
    margin-bottom: 2rem;
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

  .error-msg {
    color: #f87171;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
</style>
