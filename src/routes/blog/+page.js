import { dev } from "$app/environment";
import { env } from "$env/dynamic/public";

/** @type {import('./$types').PageLoad} */
export const load = async () => {
  const CONTENT_DIR = "posts";
  const allPostFiles = import.meta.glob("./posts/**/*.md", { eager: true });
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles
      .filter(([path]) => !path.includes("/.tmp/"))
      .map(async ([path, resolver]) => {
        /** @type {{ metadata: App.BlogPost }} */
        // @ts-expect-error - dynamic import type is unknown
        const { metadata } = resolver;
        // path looks like './posts/2026/07/matrix-set-reconciliation/+page.md'
        const prefixLength = 3 + CONTENT_DIR.length; // "./posts/".length === 8
        const postPath = path.slice(prefixLength, -9); // subtract "/+page.md"

        return {
          meta: metadata,
          path: `/blog/${CONTENT_DIR}/${postPath}`,
        };
      }),
  );

  const sortedPosts = allPosts
    .filter((post) => post.meta?.date)
    .sort((a, b) => {
      return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
    });

  const showDrafts = dev || env.PUBLIC_SHOW_DRAFTS === "true";

  return {
    posts: sortedPosts.filter((post) => showDrafts || !post.meta.draft),
  };
};
