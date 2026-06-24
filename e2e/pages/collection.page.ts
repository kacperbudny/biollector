import { expect } from "@playwright/test";
import { SetsListPageObject } from "./sets-list.page-object";

export class CollectionPage extends SetsListPageObject {
  // TODO: would it be better to use the app navigation?
  async goto() {
    await this.page.goto("/collection");
  }

  async expectEmpty() {
    await expect(this.page.getByText("Your collection is empty")).toBeVisible({
      timeout: 15_000,
    });
  }
}
