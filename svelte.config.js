import adapter from "@tg-svelte/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkFootnotes from "remark-footnotes";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_PATH || "";

/** @type {import('@tg-svelte/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  // Consult https://svelte.dev/docs/kit/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: [".md"],
      layout: join(__dirname, "./src/routes/blog/BlogLayout.svelte"),
      remarkPlugins: [remarkMath, remarkFootnotes],
      rehypePlugins: [rehypeKatex],
    }),
  ],

  kit: {
    appDir: "app",
    paths: {
      base,
    },
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      fallback: "404.html",
    }),
    prerender: {
      handleHttpError: "warn",
    },
  },
};

export default config;
