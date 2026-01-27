<script>
  import { onMount } from "svelte";

  let status = "Checking...";
  let isOperational = false;
  let homeserverConfig = "nutra.tk";
  let results = {
    config: null,
    version: null,
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
        const flows = loginData.flows?.map((f) => {
          if (f.type === "m.login.password") return "Password";
          if (f.type === "m.login.token") return "Token";
          if (f.type === "m.login.sso") return "SSO";
          if (f.type === "m.login.application_service") return "App Service";
          return f.type;
        });
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

          // Add detail if restricted
          const hasToken = regData.flows?.some((f) =>
            f.stages?.includes("m.login.registration_token"),
          );
          const hasCaptcha =
            regData.params?.["m.login.recaptcha"] ||
            regData.flows?.some((f) => f.stages?.includes("m.login.recaptcha"));

          if (hasToken && hasCaptcha)
            results.registration += " (Token/Captcha)";
          else if (hasToken) results.registration += " (Token Required)";
          else if (hasCaptcha) results.registration += " (Captcha Protected)";
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
      errorMsg = e.message;
      if (results.checks.some((c) => c.status === "Pending")) {
        const pending = results.checks.find((c) => c.status === "Pending");
        if (pending) updateCheck(pending.name, false);
      }
    }
  });

  function addCheck(name, status) {
    results.checks = [...results.checks, { name, status }];
  }

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
    <h1>
      Welcome to <span class="project-name">Continuwuity</span> on Nutratech!
    </h1>

    <p class="intro">
      Our private Matrix homeserver is successfully installed and working.
    </p>

    <div class="action-card">
      <h2>Get Started</h2>
      <p>You can connect using any Matrix client or use our web client.</p>
      <a href="https://matrix.nutra.tk" target="_blank" class="button"
        >Launch Web Client</a
      >
      <p class="subtext">Opens in a new tab to avoid security restrictions</p>
    </div>

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

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    border-bottom: none;
  }

  .project-name {
    background: linear-gradient(
      130deg,
      #ff4d4d,
      #f9cb28
    ); /* Example warm gradient */
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-weight: 800;
  }

  .intro {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
  }

  .action-card {
    background: var(--color-bg);
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    border: 1px solid var(--color-border);
  }

  .button {
    display: inline-block;
    background: var(--color-primary);
    color: white;
    padding: 0.8rem 2.5rem;
    border-radius: 50px; /* Pill shape like modern apps */
    text-decoration: none;
    font-weight: bold;
    margin: 1rem 0;
    transition:
      transform 0.1s,
      box-shadow 0.2s;
  }

  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .subtext {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .server-info {
    text-align: left;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .server-info h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  .server-info ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .server-info li {
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  /* Target the second li (Status) to make it smaller/faded */
  .server-info li:nth-child(2) {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  code {
    background: var(--color-code-bg);
    padding: 0.3em 0.6em;
    border-radius: 4px;
    color: var(--color-primary);
    font-weight: bold;
  }

  .status-ok {
    color: #4ade80; /* Green */
    font-weight: bold;
  }

  .status-error {
    color: #f87171; /* Red */
    font-weight: bold;
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

  /* Dark mode adjustments for gradient if needed */
  :global([data-theme="dark"]) .project-name {
    filter: brightness(1.2);
  }
</style>
