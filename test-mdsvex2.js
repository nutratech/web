import { compile } from "mdsvex";
import remarkFootnotes from "remark-footnotes";

compile("Hello [^1].\n\n[^1]: World", {
  remarkPlugins: [remarkFootnotes],
})
  .then((res) => console.log(res.code))
  .catch(console.error);
