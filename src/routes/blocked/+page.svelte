<script>
  import { onMount } from "svelte";

  /**
   * @typedef {Object} BlockedEntry
   * @property {string} ip
   * @property {string} comment
   */

  /** @type {BlockedEntry[]} */
  let entries = [];
  let loading = true;
  /** @type {string | null} */
  let error = null;

  onMount(async () => {
    try {
      // Use the new API endpoint
      const response = await fetch("/api/blocked");
      if (!response.ok) {
        throw new Error("Failed to fetch blocked list from API");
      }
      const data = await response.json();
      entries = data.nginx_manual?.entries || [];
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
    <div class="stat-card">
      <div class="big-number">{entries.length}</div>
      <div class="label">Total Blocked IP Addresses</div>
    </div>

    <h2>Blocked Entries</h2>
    <div class="ip-list">
      {#each entries as entry}
        <div class="ip-item">
          <span>{entry.ip}</span>
          {#if entry.comment}
            <span class="comment">{entry.comment}</span>
          {/if}
        </div>
      {/each}
    </div>

    <footer>
      <p>Data fetched live via Nutra API.</p>
      <p>Nutratech Infrastructure Protection</p>
    </footer>
  {/if}
</div>

<style>
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
