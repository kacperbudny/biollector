import { expect } from "@playwright/test";
import type { TestSet } from "../test-data";
import { SetsListPageObject } from "./sets-list.page-object";

export class WishlistPage extends SetsListPageObject {
  async goto() {
    await this.page.goto("/wishlist");
  }

  async expectEmpty() {
    await expect(this.page.getByText("Your wishlist is empty")).toBeVisible();
  }

  async expectSetInSection(section: string, set: TestSet) {
    await expect(
      this.page.getByRole("heading", { name: section }),
    ).toBeVisible();
    await expect(this.page.getByText(set.name)).toBeVisible();
  }
}
