<script>
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import "katex/dist/katex.min.css";

  const SITE_URL = "https://nutratech.github.io/web";
  const OG_IMAGE_URL = `${SITE_URL}/favicon.png`;

  export let title;
  export let description = "";
  export let subtitle = "";
  export let date;
  /** @type {string[]} */
  export let tags = [];
  export let author = "";
  export let draft = false;

  $: metaDescription = subtitle || description || title;
  $: canonicalUrl = `${SITE_URL}${page.url.pathname}`;

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
    /** @type {Map<string, number>} */
    const footnoteNumbers = new Map();
    let nextFootnoteNumber = 1;

    for (const ref of footnoteRefs) {
      if (!(ref instanceof HTMLElement)) continue;

      const href = ref.getAttribute("href");
      if (!href?.startsWith("#")) continue;

      if (!footnoteNumbers.has(href)) {
        footnoteNumbers.set(href, nextFootnoteNumber++);
      }

      ref.textContent = String(footnoteNumbers.get(href));

      const footnote = document.querySelector(href);
      if (!footnote) continue;
      if (footnote instanceof HTMLElement && !footnote.dataset.numbered) {
        footnote.dataset.numbered = "true";

        const originalChildren = Array.from(footnote.childNodes);
        const bodyWrapper = document.createElement("div");
        bodyWrapper.className = "footnote-body";
        bodyWrapper.append(...originalChildren);

        const numberLink = document.createElement("a");
        numberLink.href = `#${ref.parentElement?.id || ""}`;
        numberLink.className = "footnote-index-link";
        numberLink.textContent = `${footnoteNumbers.get(href)}.`;

        footnote.replaceChildren(
          numberLink,
          document.createTextNode(" "),
          bodyWrapper,
        );
      }

      const previewNode = footnote.cloneNode(true);
      if (!(previewNode instanceof HTMLElement)) continue;

      const previewIndexLink = previewNode.querySelector(
        ".footnote-index-link",
      );
      if (previewIndexLink instanceof HTMLElement) {
        previewIndexLink.remove();
      }

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

    for (const backref of document.querySelectorAll("a.footnote-backref")) {
      if (!(backref instanceof HTMLElement)) continue;

      const prev = backref.previousSibling;
      if (
        prev?.nodeType === Node.TEXT_NODE &&
        /\s$/.test(prev.textContent || "")
      ) {
        continue;
      }

      backref.before(document.createTextNode(" "));
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
  <meta name="description" content={metaDescription} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={OG_IMAGE_URL} />
  <meta property="og:image:secure_url" content={OG_IMAGE_URL} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={title} />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={OG_IMAGE_URL} />
  <meta name="twitter:image:alt" content={title} />
  {#if draft}
    <meta name="robots" content="noindex" />
  {/if}
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
      {#if tags.length}
        <div class="post-tags">
          {#each tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
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
  <a href={resolve("/blog")}>← Back to Blog</a>
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

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0 0 0.75rem;
  }

  .tag {
    display: inline-block;
    padding: 0.12rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-secondary);
  }

  :global(a.footnote-ref) {
    cursor: help;
    font-size: 0.9em;
    font-weight: 600;
    text-decoration: none;
  }

  :global(a.footnote-ref::before) {
    content: "[";
  }

  :global(a.footnote-ref::after) {
    content: "]";
  }

  :global(sup[id^="fnref-"]) {
    margin-left: 0.1em;
    line-height: 0;
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

  :global(.footnotes ol) {
    list-style: none;
    padding-left: 0;
  }

  :global(.footnotes li) {
    margin-bottom: 0.75rem;
  }

  :global(.footnotes li) {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.4rem;
    align-items: start;
  }

  :global(.footnote-index-link) {
    font-weight: 700;
  }

  :global(.footnote-body) {
    min-width: 0;
  }

  :global(.footnote-body > p) {
    margin: 0;
    display: inline;
  }

  :global(.footnote-body > p:not(:first-child)),
  :global(.footnote-body > ul),
  :global(.footnote-body > ol),
  :global(.footnote-body > pre),
  :global(.footnote-body > blockquote),
  :global(.footnote-body > div) {
    display: block;
    margin-top: 0.5rem;
  }

  :global(.footnote-backref) {
    display: inline;
    margin-left: 0;
    white-space: nowrap;
    text-decoration: none;
  }
</style>
