<script>
	export let data;
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article>
	<header>
		<h1>{data.meta.title}</h1>
		<div class="post-meta">
			<span>Published: {data.meta.date}</span>
			{#if data.meta.author} • <span>By {data.meta.author}</span>{/if}
		</div>
	</header>
	
	<div class="content">
		<svelte:component this={data.content} />
	</div>
</article>

<div style="margin-top: 4rem; border-top: 1px solid var(--color-border); padding-top: 2rem;">
	<a href="/blog">← Back to Blog</a>
</div>
