import { expect, test, type Page } from "@playwright/test";

// The four checks from the brief: home loads, the project ring reaches card 6, /cv renders,
// and nothing scrolls sideways at 390px. Plus reduced motion, which must show plain content.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("home loads: intro finishes, name and world are there, no errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/Kaiyur Khedun/);
  await expect(page.getByRole("heading", { level: 1, name: "Kaiyur Khedun" })).toBeVisible();
  // The veil lifts once the 3D world has drawn (or the page falls back without WebGL).
  await expect(page.locator("html")).not.toHaveClass(/js-loading/, { timeout: 10_000 });
  await expect(page.locator("html")).toHaveClass(/gl-on|no-gl/);
  expect(errors).toEqual([]);
});

test("project ring reaches card 6 and opens it", async ({ page }) => {
  await page.goto("/#work");
  const count = page.locator(".orbit-count");
  await expect(count).toHaveText(/01\s*\/\s*06/);
  const next = page.locator(".orbit-controls [data-go='1']");
  for (let i = 2; i <= 6; i++) {
    await next.click();
    await expect(count).toHaveText(new RegExp(`0${i}\\s*/\\s*06`), { timeout: 10_000 });
  }
  await expect(page.locator(".orbit-item.is-active .pcard-title")).toHaveText("Jester King");
  await page.locator(".orbit-item.is-active .pcard-link").click();
  await expect(page).toHaveURL(/\/work\/jester-king$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jester King" })).toBeVisible();
});

test("/cv renders the paper CV", async ({ page }) => {
  await page.goto("/cv");
  await expect(page.getByRole("heading", { level: 1, name: "Kaiyur Khedun" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Print/ })).toBeVisible();
});

test("no horizontal overflow at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/cv", "/work/capri", "/work/tetherfall"]) {
    await page.goto(path);
    expect(await noOverflow(page), path).toBe(0);
  }
});

test("reduced motion: no veil, no pinning, cards as a list", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/intro/);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".orbit-on")).toHaveCount(0);
  await expect(page.locator(".pcard")).toHaveCount(6);
  await expect(page.locator(".pcard").first()).toBeVisible();
  await ctx.close();
});
