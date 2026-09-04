import { NavPageObject } from "@e2e/pages/nav.page-object";
import { expect } from "@playwright/test";

export class PublicProfilePage extends NavPageObject {
  async goto(userId: string, tab?: "wishlist") {
    const path =
      tab === "wishlist" ? `/u/${userId}?tab=wishlist` : `/u/${userId}`;
    await this.page.goto(path);
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole("tablist", { name: "Profile lists" }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectCollectionTab() {
    await expect(
      this.page.getByRole("tab", { name: /Collection \(/ }),
    ).toBeVisible();
  }

  async openWishlistTab() {
    await this.page.getByRole("tab", { name: /Wishlist \(/ }).click();
    await expect(this.page).toHaveURL(/tab=wishlist/);
  }

  async expectReadOnlyCards() {
    await expect(
      this.page.getByRole("button", { name: /collection/i }),
    ).toHaveCount(0);
    await expect(
      this.page.getByRole("group", { name: "Wishlist priority" }),
    ).toHaveCount(0);
    await expect(this.page.getByRole("group", { name: "Rating" })).toHaveCount(
      0,
    );
  }
}
