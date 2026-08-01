# SvelteKit & vite-plugin-legacy Compatibility Issues

## Overview

As of January 2026, enabling `@vitejs/plugin-legacy` in a valid SvelteKit
project (versions 2.x - 2.5.x) results in a build crash. This document details
the specific errors encountered and the steps taken to investigate.

## Error Details

**Error Message:**

```
[vite-plugin-sveltekit-compile] Cannot read properties of undefined (reading 'some')
```

**Stack Trace (Example):**

```
error during build:
[vite-plugin-sveltekit-compile] Cannot read properties of undefined (reading 'some')
    at Object.handler ( .../node_modules/@sveltejs/kit/src/exports/vite/index.js:1174:46)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async PluginDriver.hookParallel ( .../rollup/dist/es/shared/node-entry.js:22475:17)
    ...
```

## Context

This error occurs specifically during the `vite build` process when the Legacy
plugin is active. It appears to be an internal conflict where the SvelteKit
compiler plugin (`vite-plugin-sveltekit-compile`) expects data that the Legacy
plugin's presence might be altering or failing to provide in the expected
format.

## Attempted Solutions

### 1. Version Downgrades

We attempted to downgrade the stack to known "stable" legacy configurations:

- **Svelte:** Downgraded from v5 to v4.2.7.
- **SvelteKit:** Downgraded from v2.49.1 to v2.5.0 and v2.0.0.
- **Vite:** Downgraded from v7 to v5.

**Result:** The specific `undefined (reading 'some')` error persisted across
these versions, suggesting a fundamental incompatibility in how modern SvelteKit
inspects or transforms chunks generated or modified by the legacy plugin.

### 2. Plugin Ordering

We attempted to move `legacy()` before `sveltekit()` in `vite.config.js` to
ensure legacy chunks were generated or handled before SvelteKit's specific
compile hooks ran.

**Result:** No change in error behavior.

### 3. Syntax Verification

We verified that the codebase did not contain Svelte 5 specific syntax (like
Runes `$props()`) that might confuse a Svelte 4 compiler. We successfully
refactored `src/routes/+layout.svelte` to use `<slot />`.

**Result:** Fixed syntax errors, but the build crash persisted.

## Current Workaround

The `legacy()` plugin has been **commented out** in `vite.config.js`. The
project currently builds successfully as a modern SvelteKit application.

To resume investigation, uncomment the plugin in `vite.config.js` and run
`npm run build`.

## Technical Analysis

The crash occurs at `node_modules/@sveltejs/kit/src/exports/vite/index.js`,
specifically where the plugin attempts to iterate over the build output:

```javascript
uses_env_dynamic_public: output.some(
  (chunk) => chunk.type === "chunk" && chunk.modules[env_dynamic_public],
);
```

The variable `output` is `undefined` at this point. This strongly suggests that
`vite-plugin-legacy`, which runs its own build passes to generate legacy chunks,
triggers this SvelteKit hook in a context where the standard Rollup `output`
array is not generated or passed as expected.

## Related Issues

Users have reported similar conflicts (e.g.,
[GitHub Issue #12](https://github.com/sveltejs/kit/issues/12)) where
`vite-plugin-legacy` causes path resolution errors
(`ENOENT: .../manifest.json`). This confirms a pattern where the legacy plugin's
modification of the output structure (generating separate manifests and entry
chunks) conflicts with SvelteKit's expectations for its client build output
analysis.
