<script>
  export let title;
  export let date;
  export let author = "";
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={title} />
</svelte:head>

<article>
  <header>
    <h1 style="margin-top: 0;">{title}</h1>
    <div class="post-meta">
      <span>Published: {date}</span>
      {#if author}
        • <span>By {author}</span>{/if}
    </div>
  </header>

  <div class="content">
    <slot />
  </div>
</article>

<div
  style="margin-top: 4rem; border-top: 1px solid var(--color-border); padding-top: 2rem;"
>
  <a href="/blog">← Back to Blog</a>
</div>
