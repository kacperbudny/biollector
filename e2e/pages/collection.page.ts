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
}
