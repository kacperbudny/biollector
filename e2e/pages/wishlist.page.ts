import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import type { TestSet } from "@e2e/test-data";
import { expect } from "@playwright/test";

export class WishlistPage extends SetsListPageObject {
  async goto() {
    await this.navigateTo("Wishlist");
  }

  async expectEmpty() {
    await expect(this.page.getByText("Your wishlist is empty")).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectSetInSection(section: string, set: TestSet) {
    const heading = this.page.getByRole("heading", { name: section });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText(set.name)).toBeVisible({
      timeout: 15_000,
    });
  }
}
