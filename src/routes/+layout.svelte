<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { PUBLIC_CV_URL } from '$env/static/public';

	let theme = 'system';

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
		}
		// document.documentElement.setAttribute('data-theme', theme); // Handled in app.html
	});

	function toggleTheme() {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		theme = newTheme;
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	/** @param {BeforeUnloadEvent} event */
	function handleBeforeUnload(event) {
		event.preventDefault();
		event.returnValue = '';
	}

	/** @param {MouseEvent} event */
	function handleAnchorClick(event) {
		if (!(event.target instanceof Element)) return;
		const target = event.target.closest('a');
		if (target && target.href && !target.href.startsWith(window.location.origin)) {
			if (!confirm('Are you sure you want to leave the site?')) {
				event.preventDefault();
			}
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window on:beforeunload={handleBeforeUnload} on:click={handleAnchorClick} />

<div class="container">
	<header>
		<nav>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/blog">Blog</a></li>
				<li><a href="/portfolio">Portfolio</a></li>
				<li><a href="https://github.com/gamesguru">GitHub</a></li>
				<li><a href="https://git.nutra.tk">Gitea</a></li>
				<li><a href={PUBLIC_CV_URL}>CV</a></li>
				<li>
					<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle Theme">
						{theme === 'dark' ? '☀️' : '🌙'}
					</button>
				</li>
			</ul>
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>
