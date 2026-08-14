import adapter from "@tg-svelte/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkFootnotes from "remark-footnotes";
import rehypePrettyCode from "rehype-pretty-code";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_PATH || "";

// mdsvex's own `highlight: false` path pre-escapes `<`, `>`, `{`, `}` inside
// fenced code blocks into HTML entities (see mdsvex's `escape_code`) on the
// assumption that nothing downstream will escape them again. That's true if
// mdsvex's own Prism highlighter runs, but false once rehype-pretty-code/
// Shiki takes over: it treats the (already-escaped) text as real source,
// tokenizes it, and its HTML serializer escapes the stray `&` a second time
// — `<` becomes `&lt;` then `&amp;lt;`, which renders as literal "&lt;" text.
// mdsvex offers no config to skip its pre-escape while still leaving code
// nodes as real hast trees, so this remark plugin undoes it: it runs after
// mdsvex's internal `escape_code` step (remarkPlugins are applied later in
// mdsvex's pipeline) and restores the original characters before
// remark-rehype/rehype-pretty-code ever see them, so the final HTML
// serializer (`rehypeEscapeSvelteText`, below) escapes each character
// exactly once. `inlineCode` (single backticks) gets this same pre-escape
// unconditionally in mdsvex, regardless of the `highlight` setting, so it
// needs the same treatment as fenced `code` blocks.
function unescapeMdsvexCodeEntities() {
  const entities = [
    [/&lt;/g, "<"],
    [/&gt;/g, ">"],
    [/&#123;/g, "{"],
    [/&#125;/g, "}"],
  ];
  return (tree) => {
    const visit = (node) => {
      if (
        (node.type === "code" || node.type === "inlineCode") &&
        typeof node.value === "string"
      ) {
        for (const [pattern, replacement] of entities) {
          node.value = node.value.replace(pattern, replacement);
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

// mdsvex's brace/bracket safety (`escape_code`, `escape_brackets`) only runs
// during its own markdown-parse phase, on the original source text. Content
// injected later by *rehype* plugins — Shiki's tokenized code spans, KaTeX's
// raw math markup — never passes through that step, so a real `<`, `>`, `{`,
// or `}` surviving into a hast text node reaches mdsvex's hast-to-Svelte
// output raw. Svelte's template parser then reads a bare `<` as the start of
// a new element/component tag, or a bare `{` as the start of an expression,
// and fails to compile. This plugin runs last in the rehype chain and
// HTML-escapes plain hast `text` nodes exactly once; it deliberately leaves
// `raw`/`element` nodes alone, since that's how KaTeX's actual `<math>`
// markup is represented and it must stay real markup, not escaped text.
function rehypeEscapeSvelteText() {
  const entities = [
    [/&/g, "&amp;"],
    [/</g, "&lt;"],
    [/>/g, "&gt;"],
    [/{/g, "&#123;"],
    [/}/g, "&#125;"],
  ];
  return (tree) => {
    const visit = (node) => {
      if (node.type === "text" && typeof node.value === "string") {
        for (const [pattern, replacement] of entities) {
          node.value = node.value.replace(pattern, replacement);
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

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
      // mdsvex ships its own Prism-based highlighter and runs it before any
      // rehype plugin sees the tree; Prism's core build doesn't reliably
      // cover the languages we use, and worse, whenever `highlight` is a
      // truthy config it *always* re-fills a highlighter internally (mdsvex
      // has no supported way to opt out while keeping real hast code
      // nodes) and converts the block into a raw `{@html ...}` string that
      // rehype plugins never see. `highlight: false` is the only way to get
      // a proper hast `<pre><code class="language-x">` node through to
      // rehype-pretty-code/Shiki — see `unescapeMdsvexCodeEntities` above
      // for the entity pre-escaping quirk that path brings with it.
      highlight: false,
      remarkPlugins: [remarkMath, remarkFootnotes, unescapeMdsvexCodeEntities],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypePrettyCode,
          {
            theme: { light: "github-light", dark: "github-dark" },
            keepBackground: false,
          },
        ],
        rehypeEscapeSvelteText,
      ],
    }),
  ],

  kit: {
    appDir: "app",
    paths: {
      base,
      relative: false,
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
