<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
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
				<li><a href="/cv.pdf">CV</a></li>
			</ul>
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>
