<script>
  import { onMount } from "svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.png";
  import { PUBLIC_CV_URL, PUBLIC_BUILD_TIME } from "$env/static/public";

  let theme = "system";

  let protocol = "HTTP/1.1";
  let latency = "...";
  let servedTime = "...";

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme = prefersDark ? "dark" : "light";
    }
    // document.documentElement.setAttribute('data-theme', theme); // Handled in app.html

    // Client-side Metrics
    if (window.performance) {
      const navEntries = window.performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const navEntry = /** @type {PerformanceNavigationTiming} */ (
          navEntries[0]
        );
        // @ts-ignore
        protocol = navEntry.nextHopProtocol || "HTTP/2.0";
        latency =
          Math.round(navEntry.responseStart - navEntry.requestStart) + "ms";
      }
    }

    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    // @ts-ignore
    servedTime = now.toLocaleDateString("en-GB", options).replace(",", "");
  });

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    theme = newTheme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  /** @param {MouseEvent} event */
  function handleAnchorClick(event) {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest("a");
    if (!target) return;

    const isExternal =
      target.href && !target.href.startsWith(window.location.origin);

    if (isExternal) {
      if (!confirm("Are you sure you want to leave the site?")) {
        event.preventDefault();
      }
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:window on:click={handleAnchorClick} />

<div class="container">
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/portfolio">Portfolio</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/chat">Chat</a></li>
        <li><a href={PUBLIC_CV_URL}>CV</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>
          <button
            class="theme-toggle"
            on:click={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </li>
      </ul>
    </nav>
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <p>
      <!-- @ts-ignore -->
      <!-- @ts-ignore -->
      Built: {PUBLIC_BUILD_TIME} |
      <!-- @ts-ignore -->
      Services: {__SERVICES_COUNT__} | Server: San Jose, CA
    </p>
    <p>
      Nginx: <span class="ssi">v1.28.1</span> | Protocol:
      <span class="ssi">{protocol}</span>
      | Served: <span class="ssi">{servedTime}</span> | Latency:
      <span class="ssi">{latency}</span>
    </p>
    <p>
      Hosted with love thanks to <a
        href="https://heliohost.org"
        target="_blank"
        rel="noopener noreferrer">HelioHost</a
      >
      | <a href="/blocked.html" target="_blank">Transparency Report</a>
    </p>

    <p class="commit-hash">
      Built statically with SvelteJS | Ref: <a
        href="https://github.com/gamesguru/my-website/commit/{__COMMIT_HASH__}"
        target="_blank"
        rel="noopener noreferrer">{__COMMIT_HASH__}</a
      >
    </p>
  </footer>
</div>

<style>
  footer {
    margin-top: 3rem;
    text-align: center;
    padding: 1.5rem 0;
    font-size: 0.85rem;
    color: var(--color-secondary);
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  footer p {
    margin: 0.5rem 0;
  }

  .ssi {
    font-family: var(--font-mono);
    background: var(--color-code-bg);
    padding: 0.2em 0.5em;
    border-radius: 3px;
    color: var(--color-text);
    font-size: 0.9em;
  }

  footer a {
    color: var(--color-primary);
    text-decoration: underline;
  }

  footer a:hover {
    color: var(--color-primary-hover);
  }

  .commit-hash {
    font-size: 0.75rem;
    opacity: 0.7;
  }
</style>
