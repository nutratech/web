<script>
  import { onMount } from "svelte";

  export let title;
  export let subtitle = "";
  export let date;
  export let author = "";
  export let draft = false;

  onMount(async () => {
    // Dynamically load Mermaid to avoid SSR issues
    const loadMermaid = new Function(
      'return import("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs")',
    );
    const mermaid = (await loadMermaid()).default;
    mermaid.initialize({ startOnLoad: false });

    // mdsvex wraps code blocks in <pre><code class="language-mermaid">
    // We need to unwrap them so the CSS/background of <pre> doesn't ruin the diagram
    const blocks = document.querySelectorAll("code.language-mermaid");
    for (const block of blocks) {
      const pre = block.parentElement;
      if (!pre) continue;

      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = block.textContent;
      mermaidDiv.style.display = "flex";
      mermaidDiv.style.justifyContent = "center";
      pre.replaceWith(mermaidDiv);
    }

    if (blocks.length > 0) {
      mermaid.run({ querySelector: ".mermaid" });
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={title} />
  {#if draft}
    <meta name="robots" content="noindex" />
  {/if}
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
    integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
    crossorigin="anonymous"
  />
</svelte:head>

{#if draft}
  <article>
    <div class="blog-header">
      <h1 style="margin-top: 0;">Not Found</h1>
      <div class="post-meta">
        <span>This draft is not published.</span>
      </div>
    </div>
  </article>
{:else}
  <article>
    <div class="blog-header">
      <h1 style="margin-top: 0;">{title}</h1>
      {#if subtitle}
        <p class="post-subtitle">{subtitle}</p>
      {/if}
      <div class="post-meta">
        <span>Published: {date}</span>
        {#if author}
          • <span>By {author}</span>
        {/if}
        {#if draft}
          • <span class="draft-badge">Draft</span>
        {/if}
      </div>
    </div>

    <div class="content">
      <slot />
    </div>
  </article>
{/if}

<div
  style="margin-top: 4rem; border-top: 1px solid var(--color-border); padding-top: 2rem;"
>
  <a href="/blog">← Back to Blog</a>
</div>

<style>
  .blog-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .draft-badge {
    color: var(--color-primary);
    font-weight: 700;
  }

  .post-subtitle {
    margin: 0 0 0.75rem;
    color: var(--color-secondary);
    font-size: 1.1rem;
  }
</style>
