export const load = async ({ fetch }) => {
  const allPostFiles = import.meta.glob("/src/lib/posts/*.md", { eager: true });
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const metadata = resolver.metadata;
      const postPath = path.slice(11, -3); // remove '/src/lib/posts/' and '.md'
      // actually path is /src/lib/posts/filename.md.
      // "/src/lib/posts/".length is 15.
      // Let's use split.
      const slug = path.split("/").pop().slice(0, -3);

      return {
        meta: metadata,
        path: `/blog/${slug}`,
      };
    }),
  );

  const sortedPosts = allPosts.sort((a, b) => {
    return new Date(b.meta.date) - new Date(a.meta.date);
  });

  return {
    posts: sortedPosts,
  };
};
