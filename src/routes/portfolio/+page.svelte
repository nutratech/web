<svelte:head>
  <title>Portfolio | Nutratech</title>
</svelte:head>

<h1>Portfolio</h1>
<p class="intro">Explore my code and projects across different platforms.</p>

<div class="grid">
  <a href="https://git.nutra.tk" class="card">
    <h2>Gitea</h2>
    <p>Self-hosted private repositories and internal projects.</p>
    <span class="link-text">Visit Gitea &rarr;</span>
  </a>

  <a href="https://github.com/gamesguru" class="card" target="_blank">
    <h2>GitHub</h2>
    <p>Public open-source contributions and personal projects.</p>
    <span class="link-text">Visit GitHub &rarr;</span>
  </a>
</div>

<style>
  .intro {
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .card {
    display: block;
    background: var(
      --bg-card,
      var(--color-code-bg)
    ); /* Fallback to code-bg if card undefined */
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2rem;
    text-decoration: none;
    color: var(--color-text);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }

  .card h2 {
    margin-top: 0;
    color: var(--color-primary);
    font-size: 1.5rem;
    border-bottom: none;
  }

  .card p {
    margin: 1rem 0;
    line-height: 1.5;
    color: var(--text-secondary, var(--color-secondary));
  }

  .link-text {
    color: var(--color-primary);
    font-weight: bold;
    font-size: 0.9rem;
  }
</style>
