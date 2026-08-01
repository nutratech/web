<script>
  import { onMount } from "svelte";

  export let title;
  export let subtitle = "";
  export let date;
  export let author = "";
  export let draft = false;

  onMount(() => {
    /** @type {number | undefined} */
    let hideTooltipTimeout;
    const tooltip = document.createElement("div");
    tooltip.className = "footnote-tooltip";
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    const cancelHide = () => {
      window.clearTimeout(hideTooltipTimeout);
    };

    const hideTooltip = () => {
      tooltip.hidden = true;
      tooltip.textContent = "";
    };

    const scheduleHide = () => {
      cancelHide();
      hideTooltipTimeout = window.setTimeout(hideTooltip, 120);
    };

    /** @param {HTMLElement} ref */
    const positionTooltip = (ref) => {
      const rect = ref.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const top = window.scrollY + rect.bottom + 10;
      const maxLeft =
        window.scrollX + window.innerWidth - tooltipRect.width - 12;
      const centeredLeft =
        window.scrollX + rect.left + rect.width / 2 - tooltipRect.width / 2;
      const left = Math.max(
        window.scrollX + 12,
        Math.min(centeredLeft, maxLeft),
      );

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    };

    /**
     * @param {HTMLElement} ref
     * @param {string} previewHtml
     */
    const showTooltip = (ref, previewHtml) => {
      cancelHide();
      tooltip.innerHTML = previewHtml;
      tooltip.hidden = false;
      positionTooltip(ref);
    };

    const footnoteRefs = document.querySelectorAll("a.footnote-ref");
    for (const ref of footnoteRefs) {
      if (!(ref instanceof HTMLElement)) continue;

      const href = ref.getAttribute("href");
      if (!href?.startsWith("#")) continue;

      const footnote = document.querySelector(href);
      if (!footnote) continue;

      const previewNode = footnote.cloneNode(true);
      if (!(previewNode instanceof HTMLElement)) continue;

      for (const backref of previewNode.querySelectorAll(
        "a.footnote-backref",
      )) {
        backref.remove();
      }

      const previewHtml = previewNode.innerHTML.trim();
      if (!previewHtml) continue;

      ref.setAttribute(
        "aria-label",
        previewNode.textContent?.replace(/\s+/g, " ").trim() ||
          "Footnote preview",
      );
      ref.addEventListener("mouseenter", () => showTooltip(ref, previewHtml));
      ref.addEventListener("focus", () => showTooltip(ref, previewHtml));
      ref.addEventListener("mouseleave", scheduleHide);
      ref.addEventListener("blur", scheduleHide);
    }

    tooltip.addEventListener("mouseenter", cancelHide);
    tooltip.addEventListener("mouseleave", scheduleHide);

    (async () => {
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
    })();

    return () => {
      cancelHide();
      tooltip.remove();
    };
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

  :global(a.footnote-ref) {
    cursor: help;
  }

  :global(.footnote-tooltip) {
    position: absolute;
    z-index: 1000;
    max-width: min(34rem, calc(100vw - 24px));
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    line-height: 1.45;
    font-size: 0.95rem;
    pointer-events: auto;
  }
</style>
