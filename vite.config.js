import { sveltekit } from "@tg-svelte/kit/vite";
import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

// Read services count
/** @type {{ groups: { services: any[] }[] }} */
const services = JSON.parse(readFileSync("./src/lib/services.json", "utf-8"));
const servicesCount = services.groups.reduce(
  (/** @type {number} */ acc, /** @type {any} */ group) =>
    acc + group.services.length,
  0,
);

// Format date: 2026-01-27 15:45:13
const now = new Date();
const buildTimestamp = now.toISOString().replace("T", " ").split(".")[0];

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __SERVICES_COUNT__: JSON.stringify(servicesCount),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  plugins: [
    legacy({
      targets: ["ie 11"],
    }),
    /** @type {any} */ (sveltekit()),
  ],
  server: {
    fs: {
      allow: [".."],
    },
  },
});
