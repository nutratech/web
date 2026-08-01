<script>
  export let data;
</script>

<h1>Blog Posts</h1>

<ul class="post-list">
  {#each data.posts as post, index}
    <li class="post-item">
      <h2><a href={post.path}>{post.meta.title}</a></h2>
      <div class="post-meta">
        <span>{post.meta.date}</span>
        {#if post.meta.author}
          • <span>{post.meta.author}</span>{/if}
      </div>
      {#if post.meta.description}
        <p class="post-desc">{post.meta.description}</p>
      {/if}
      {#if index < data.posts.length - 1}
        <br />
      {/if}
    </li>
  {/each}
</ul>
