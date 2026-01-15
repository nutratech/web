/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const allPostFiles = import.meta.glob("/src/lib/posts/*.md", { eager: true });
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      /** @type {{ metadata: App.BlogPost }} */
      // @ts-expect-error - dynamic import type is unknown
      const { metadata } = resolver;
      const parts = path.split("/");
      const slug = parts.pop()?.slice(0, -3);

      return {
        meta: metadata,
        path: `/blog/${slug}`,
      };
    }),
  );

  const sortedPosts = allPosts.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return {
    posts: sortedPosts,
  };
};
