import { sveltekit } from "@tg-svelte/kit/vite";
import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

let commitHash = "unknown";
try {
  commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
    encoding: "utf-8",
  }).trim();
} catch {
  // Keep local checks/builds working when git is unavailable or shelling out is restricted.
}

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
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
    fs: {
      allow: [
        "..",
        "/home/shane/repos/nutra/vps-root",
        "/home/shane/repos/svelte-kit",
      ],
    },
  },
});
