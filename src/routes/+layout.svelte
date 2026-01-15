<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_CV_URL } from '$env/static/public';

	let theme = 'system';

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
			document.documentElement.setAttribute('data-theme', theme);
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
		}
	});

	function toggleTheme() {
		if (theme === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'light' : 'dark';
		} else if (theme === 'dark') {
			theme = 'light';
		} else {
			theme = 'dark';
		}
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
	<header>
		<nav>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/blog">Blog</a></li>
				<li><a href="/portfolio">Portfolio</a></li>
				<li><a href="https://github.com/shane">GitHub</a></li>
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
