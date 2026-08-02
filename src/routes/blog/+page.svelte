<script>
  import { resolve } from "$app/paths";

  export let data;
</script>

<h1>Blog Posts</h1>

<ul class="post-list">
  {#each data.posts as post, index}
    <li class="post-item">
      <h2>
        <a href={resolve(/** @type {any} */ (post.path))}>{post.meta.title}</a>
      </h2>
      <div class="post-meta">
        <span>{post.meta.date}</span>
        {#if post.meta.author}
          • <span>{post.meta.author}</span>{/if}
      </div>
      {#if post.meta.tags?.length}
        <div class="post-tags">
          {#each post.meta.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      {/if}
      {#if post.meta.description}
        <p class="post-desc">{post.meta.description}</p>
      {/if}
      {#if index < data.posts.length - 1}
        <br />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0.4rem 0 0.6rem;
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
</style>
