import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await mkdir("e2e/.auth", { recursive: true });

  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL ?? "";
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD ?? "";

  await page.goto("/auth/sign-in");

  await page.locator('[type="email"]').fill(email);
  await page.locator('[type="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(page).not.toHaveURL(/sign-in/);

  await page.context().storageState({ path: authFile });
});
