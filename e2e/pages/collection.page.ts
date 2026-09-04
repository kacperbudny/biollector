import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import { expect } from "@playwright/test";

export class CollectionPage extends SetsListPageObject {
  async goto() {
    await this.navigateTo("Collection");
  }

  async expectEmpty() {
    await expect(this.page.getByText("Your collection is empty")).toBeVisible({
      timeout: 15_000,
    });
  }

  async copyProfileLink(): Promise<string> {
    await this.page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    await this.page.getByRole("button", { name: "Copy profile link" }).click();
    await expect(this.page.getByText("Link copied")).toBeVisible({
      timeout: 10_000,
    });
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
