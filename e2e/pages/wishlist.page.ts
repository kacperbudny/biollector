import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import { expect } from "@playwright/test";

export class WishlistPage extends SetsListPageObject {
  async goto() {
    await this.navigateTo("Wishlist");
    await this.expectPageReady();
  }

  async expectEmpty() {
    await this.expectPageReady();
    await expect(this.page.getByText("Your wishlist is empty")).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectLoaded() {
    await this.expectPageReady();
    await expect(async () => {
      const empty = this.page.getByText("Your wishlist is empty");
      if (await empty.isVisible()) {
        await this.page.reload();
        await this.expectPageReady();
      }
      await expect(empty).toBeHidden();
    }).toPass({ timeout: 30_000 });
  }

  private async expectPageReady() {
    await expect(
      this.page.getByRole("heading", { level: 1, name: /^Wishlist/ }),
    ).toBeVisible({ timeout: 15_000 });
  }
}
