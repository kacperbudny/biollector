import { expect } from "@playwright/test";
import type { TestSet } from "../test-data";
import { SetsListPageObject } from "./sets-list.page-object";

export class WishlistPage extends SetsListPageObject {
  async goto() {
    await this.page.goto("/wishlist");
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
