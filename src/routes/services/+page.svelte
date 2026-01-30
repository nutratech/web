<script>
  import servicesData from "$lib/services.json";
  import { PUBLIC_BUILD_TIME } from "$env/static/public";

  // Format date nicely
  const generatedDate = new Date(PUBLIC_BUILD_TIME).toLocaleString();
</script>

<svelte:head>
  <title>Services | Nutratech</title>
</svelte:head>

<section class="services-page">
  <h1>All Services</h1>
  <p class="meta">Generated automatically: {generatedDate}</p>

  <div class="intro">
    <p>
      The site is under construction/rebuild... all the services are run from
      two VPS servers, one with 1 GB and another with 2 GB of RAM.
    </p>
    <p>
      Please see the services we have online below during our extensive rebuild
      process (Jan 2026).
    </p>
  </div>

  {#each servicesData.groups as group}
    {#if group.services.length > 0}
      <h2 class="group-header">{group.name}</h2>
      <div class="services-grid">
        {#each group.services as service}
          <div class="service-card">
            <h3><a href={service.url}>{service.id}</a></h3>
            <p class="desc">{service.description}</p>
            <span class="url">{service.url}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/each}
</section>

<style>
  .services-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .meta {
    font-size: 0.85em;
    color: var(--color-text-muted);
    margin-bottom: 2rem;
  }

  .intro {
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--color-bg-card);
    border-radius: 8px;
    border-left: 4px solid var(--color-primary);
  }

  .group-header {
    margin-top: 2rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .service-card {
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-bg-card);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .service-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }

  .service-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .service-card a {
    text-decoration: none;
    color: var(--color-primary);
  }

  .service-card a:hover {
    text-decoration: underline;
    color: var(--color-primary-hover);
  }

  .desc {
    color: var(--color-text-muted);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .url {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--color-secondary);
    word-break: break-all;
  }
</style>
