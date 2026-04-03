---
name: playwright-cli
description: Reference skill for using Playwright CLI — screenshots, codegen, testing, and browser automation from the command line
whenToUse: Use when you need to automate browser actions, capture screenshots, generate test code, or run end-to-end tests via CLI
---

## Overview

Playwright CLI (`npx playwright`) allows browser automation directly from the terminal — no test framework required. Available on this server as `npx playwright` (v1.59.1).

**Core principle:** Always use `npx playwright` — the global `playwright` binary is not in PATH.

## Quick Reference

```bash
# Screenshots
npx playwright screenshot <url> <file.png>
npx playwright screenshot --full-page <url> <file.png>
npx playwright screenshot --browser firefox <url> <file.png>
npx playwright screenshot --viewport-size "1920, 1080" <url> <file.png>
npx playwright screenshot --wait-for-selector "#app" <url> <file.png>
npx playwright screenshot --device "iPhone 15" <url> <file.png>
npx playwright screenshot --color-scheme dark <url> <file.png>

# Open browser (interactive)
npx playwright open <url>
npx playwright cr <url>   # Chromium
npx playwright ff <url>   # Firefox
npx playwright wk <url>   # WebKit

# Code generation (records user actions → test code)
npx playwright codegen <url>
npx playwright codegen --target javascript <url>
npx playwright codegen --target python <url>
npx playwright codegen --output tests/my-test.spec.ts <url>

# Run tests
npx playwright test
npx playwright test tests/home.spec.ts
npx playwright test --headed                  # visible browser
npx playwright test --debug                   # inspector mode
npx playwright test --project=chromium
npx playwright test --grep "login"
npx playwright test --workers 4
npx playwright test --last-failed             # rerun only failures
npx playwright test --reporter=html && npx playwright show-report

# Trace viewer (debug failed tests)
npx playwright show-trace trace.zip
npx playwright trace view path/to/trace

# Install browsers
npx playwright install
npx playwright install chromium
npx playwright install --with-deps chromium
```

## Screenshot Patterns

### Capture localhost app

```bash
npx playwright screenshot http://localhost:3001 screenshot.png
npx playwright screenshot --full-page http://192.168.1.100:3004 dashboard.png
```

### Wait for element before capturing

```bash
npx playwright screenshot \
  --wait-for-selector ".dashboard-loaded" \
  --timeout 10000 \
  http://localhost:3001 app.png
```

### Mobile viewport

```bash
npx playwright screenshot \
  --device "iPhone 15" \
  http://localhost:3000 mobile.png
```

### Save with timestamp

```bash
npx playwright screenshot http://localhost:3001 "screenshot-$(date +%Y%m%d-%H%M%S).png"
```

## Code Generation Workflow

1. Run `npx playwright codegen <url>` — opens browser + inspector
2. Interact with the page — actions are recorded in real-time
3. Copy generated code from inspector panel
4. Save to `tests/` directory as `.spec.ts`

## Test File Structure

```typescript
import { test, expect } from "@playwright/test";

test("page loads correctly", async ({ page }) => {
  await page.goto("http://localhost:3001");
  await expect(page).toHaveTitle(/ClawPort/);
  await expect(page.locator(".agent-list")).toBeVisible();
});

test("screenshot baseline", async ({ page }) => {
  await page.goto("http://localhost:3001");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("baseline.png");
});
```

## playwright.config.ts Minimal Setup

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3001",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
});
```

## Browsers Available

| Alias | Browser  | Flag          |
| ----- | -------- | ------------- |
| `cr`  | Chromium | `-b chromium` |
| `ff`  | Firefox  | `-b firefox`  |
| `wk`  | WebKit   | `-b webkit`   |

Install if missing: `npx playwright install <browser>`

## Useful Flags

| Flag                         | Purpose                            |
| ---------------------------- | ---------------------------------- |
| `--full-page`                | Capture entire scrollable page     |
| `--wait-for-selector <sel>`  | Wait for element before action     |
| `--wait-for-timeout <ms>`    | Wait fixed time before action      |
| `--viewport-size "W, H"`     | Set browser viewport               |
| `--device <name>`            | Emulate mobile device              |
| `--color-scheme dark\|light` | Emulate color scheme preference    |
| `--ignore-https-errors`      | Skip SSL errors (local dev)        |
| `--timeout <ms>`             | Override default action timeout    |
| `--headed`                   | Show browser window (test command) |
| `--debug`                    | Open Playwright Inspector          |
| `--last-failed`              | Rerun only failed tests            |
| `--reporter html`            | Generate HTML report               |

## Red Flags

| Thought                                 | Reality                                                  |
| --------------------------------------- | -------------------------------------------------------- |
| "Use `playwright` directly"             | Binary not in PATH — always use `npx playwright`         |
| "Screenshot failed, retry same command" | Check if selector exists, add `--wait-for-selector`      |
| "I'll skip browser install"             | Run `npx playwright install` first if browsers missing   |
| "Full page screenshot looks cut off"    | Add `--full-page` flag                                   |
| "Test works locally but fails in CI"    | CI needs `--headed=false` (default) + installed browsers |
