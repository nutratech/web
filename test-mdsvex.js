import { compile } from "mdsvex";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

compile("Hello $Host_A$", {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
})
  .then((res) => console.log(res.code))
  .catch(console.error);
