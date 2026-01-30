<script>
  import { onMount } from "svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.png";
  import { PUBLIC_CV_URL, PUBLIC_BUILD_TIME } from "$env/static/public";

  let theme = "system";

  let protocol = "HTTP/1.1";
  let latency = "...";
  let servedTime = "...";

  onMount(async () => {
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
      // Server Info
      try {
        const res = await fetch("/api/server-info");
        if (res.ok) {
          const data = await res.json();
          // @ts-ignore
          if (data.location) {
            // @ts-ignore
            document.getElementById("server-location").innerText =
              data.location;
          }
        }
      } catch (e) {
        console.error("Failed to fetch server info", e);
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
      target.href &&
      !target.href.startsWith(window.location.origin) &&
      !target.href.startsWith("blob:");

    if (isExternal) {
      if (!confirm("Are you sure you want to leave the site?")) {
        event.preventDefault();
      }
    }
  }

  /** @type {string | null} */
  let activeDropdown = null;

  /** @param {string} name */
  function toggleDropdown(name) {
    activeDropdown = activeDropdown === name ? null : name;
  }

  /** @param {MouseEvent} event */
  function handleClickOutside(event) {
    if (!(event.target instanceof Element)) return;
    // Close dropdown if clicking outside of any dropdown
    if (!event.target.closest(".dropdown")) {
      activeDropdown = null;
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:window on:click={handleAnchorClick} on:click={handleClickOutside} />

<div class="container">
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>

        <li class="dropdown" class:open={activeDropdown === "portfolio"}>
          <button class="dropbtn" on:click={() => toggleDropdown("portfolio")}
            >Portfolio ▾</button
          >
          <div class="dropdown-content">
            <a href="/portfolio" on:click={() => (activeDropdown = null)}
              >Projects</a
            >
            <a href="/resume" on:click={() => (activeDropdown = null)}>Resume</a
            >
            <a href="/contact" on:click={() => (activeDropdown = null)}
              >Contact</a
            >
            <a href="/blog" on:click={() => (activeDropdown = null)}>Blog</a>
          </div>
        </li>

        <li class="dropdown" class:open={activeDropdown === "services"}>
          <button class="dropbtn" on:click={() => toggleDropdown("services")}
            >Services ▾</button
          >
          <div class="dropdown-content">
            <a href="/services" on:click={() => (activeDropdown = null)}
              >Overview</a
            >
            <a href="/chat" on:click={() => (activeDropdown = null)}>Chat</a>
            <a href="/blocked" on:click={() => (activeDropdown = null)}
              >Transparency</a
            >
          </div>
        </li>

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
      Services: {__SERVICES_COUNT__} | Server:
      <span id="server-location" class="ssi">Loading...</span>
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
      | <a href="/blocked">Transparency Report</a>
    </p>

    <p class="commit-hash">
      Built statically with SvelteJS | Ref: <a
        href="https://gitlab.com/gamesguru/my-website/commit/{__COMMIT_HASH__}"
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

  /* Dropdown Styles */
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropbtn {
    background-color: transparent;
    color: var(--color-primary);
    padding: 0;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    min-width: 120px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    top: 100%;
  }

  .dropdown-content a {
    color: var(--color-text);
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-primary);
  }

  .dropdown.open .dropdown-content {
    display: block;
  }

  .dropdown.open .dropbtn {
    color: var(--color-primary-hover);
  }
</style>
