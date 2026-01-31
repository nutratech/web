<script>
  import { onMount } from "svelte";

  /**
   * @typedef {Object} BlockedEntry
   * @property {string} ip
   * @property {string} comment
   */

  /** @type {any} */
  let manualEntries = [];
  /** @type {any} */
  let sshStats = null;
  /** @type {string[]} */
  let sshIps = [];
  /** @type {any} */
  let gitStats = null;
  /** @type {string[]} */
  let gitIps = [];
  /** @type {any} */
  let matrixStats = null;
  /** @type {{ip: string, hostname: string}[]} */
  let matrixIps = [];

  let loading = true;
  /** @type {string | null} */
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch("/api/blocked");
      if (!response.ok) {
        throw new Error("Failed to fetch blocked list from API");
      }
      const data = await response.json();

      // Manual Nginx Bans
      manualEntries = data.nginx_manual?.entries || [];

      // SSH Stalkers (Fail2Ban)
      sshStats = data.ssh_stalkers || {};
      if (sshStats.banned_ips && typeof sshStats.banned_ips === "string") {
        sshIps = sshStats.banned_ips.split(/\s+/).filter(Boolean);
      }

      // Git Scrapers (Fail2Ban)
      gitStats = data.git_scrapers || {};
      if (gitStats.banned_ips && typeof gitStats.banned_ips === "string") {
        gitIps = gitStats.banned_ips.split(/\s+/).filter(Boolean);
      }

      // Matrix Federation (Friendly)
      matrixStats = data.matrix_federation || {};
      if (Array.isArray(matrixStats.peers)) {
        matrixIps = matrixStats.peers;
      } else if (matrixStats.ips && typeof matrixStats.ips === "string") {
        // Fallback for old cache
        matrixIps = matrixStats.ips
          .split(/\s+/)
          .filter(Boolean)
          .map((/** @type {string} */ ip) => ({ ip, hostname: "Unknown" }));
      }
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = String(e);
      }
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Nutratech | Blocked IPs</title>
</svelte:head>

<div class="page-container">
  <h1>🛡️ Global Ban List</h1>

  {#if loading}
    <p class="status">Loading live data...</p>
  {:else if error}
    <p class="status error">Error: {error}</p>
  {:else}
    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="big-number">{manualEntries.length}</div>
        <div class="label">Manual Bans</div>
      </div>
      <div class="stat-card">
        <div class="big-number">{sshStats?.currently_banned || 0}</div>
        <div class="label">SSH Stalkers</div>
      </div>
      <div class="stat-card">
        <div class="big-number">{gitStats?.currently_banned || 0}</div>
        <div class="label">Git Scrapers</div>
      </div>
      <div class="stat-card blue-card">
        <div class="big-number blue-text">
          {matrixStats?.active_count || matrixStats?.active_servers || 0}
        </div>
        <div class="label">Active Peers</div>
      </div>
    </div>

    <!-- Manual Bans Section -->
    {#if manualEntries.length > 0}
      <h2>Manual Nginx Bans</h2>
      <div class="ip-list">
        {#each manualEntries as entry}
          <div class="ip-item">
            <span>{entry.ip}</span>
            {#if entry.comment}
              <span class="comment">{entry.comment}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- SSH Bans Section -->
    {#if sshIps.length > 0}
      <h2>SSH Stalkers (Fail2Ban)</h2>
      <p class="subtitle">Caught attempting unauthorized SSH access.</p>
      <div class="ip-list compact">
        {#each sshIps as ip}
          <span class="bad-ip">{ip}</span>
        {/each}
      </div>
    {/if}

    <!-- Git Scraper Bans Section -->
    {#if gitIps.length > 0}
      <h2>Git Scrapers</h2>
      <p class="subtitle">Caught scanning for .git config files.</p>
      <div class="ip-list compact">
        {#each gitIps as ip}
          <span class="bad-ip">{ip}</span>
        {/each}
      </div>
    {:else if gitStats?.total_banned > 0}
      <h2>Git Scrapers</h2>
      <p class="subtitle">
        No active bans, but {gitStats.total_banned} historical bans.
      </p>
    {/if}

    <!-- Matrix Friendly Section -->
    {#if matrixIps.length > 0}
      <h2 class="blue-header">Verified Matrix Peers</h2>
      <p class="subtitle">Friendly servers actively federating with us.</p>
      <div class="ip-list compact">
        {#each matrixIps as peer}
          <span class="good-ip" title={peer.hostname || "Resolving..."}>
            {peer.ip}
            {#if peer.hostname && peer.hostname !== "Unknown" && peer.hostname !== peer.ip}
              <span class="dns-name">({peer.hostname})</span>
            {/if}
          </span>
        {/each}
      </div>
    {/if}

    <footer>
      <p>Data fetched live via Nutra API.</p>
      <p>Nutratech Infrastructure Protection</p>
    </footer>
  {/if}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .compact {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .bad-ip {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-danger, #ef4444);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .good-ip {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6; /* Blue-500 */
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dns-name {
    font-size: 0.8em;
    opacity: 0.8;
    color: var(--color-text-muted);
  }

  .blue-text {
    color: #3b82f6 !important;
  }

  .blue-header {
    border-color: #3b82f6;
  }

  .subtitle {
    color: var(--color-text-muted);
    margin-bottom: 1rem;
    font-style: italic;
  }

  .page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--color-bg-card, #1e293b);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;
  }

  .big-number {
    font-size: 4rem;
    font-weight: 700;
    color: var(--color-danger, #ef4444);
    line-height: 1;
  }

  .label {
    font-size: 1.2rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .ip-list {
    background: var(--color-bg-card, #1e293b);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    font-family: monospace;
    max-height: 400px;
    overflow-y: auto;
  }

  .ip-item {
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(51, 65, 85, 0.3);
    display: flex;
    justify-content: space-between;
  }

  .ip-item:last-child {
    border-bottom: none;
  }

  .comment {
    color: var(--color-text-dim);
    font-style: italic;
  }

  .status {
    text-align: center;
    font-size: 1.2rem;
    margin: 3rem 0;
  }

  .error {
    color: var(--color-danger, #ef4444);
  }

  footer {
    margin-top: 3rem;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
</style>
