import type { TestSet } from "../test-data";
import { SetsListPageObject } from "./sets-list.page-object";

export class SetsPage extends SetsListPageObject {
  async goto() {
    await this.page.goto("/sets");
  }

  async removeFromCollectionIfPresent(set: TestSet) {
    await this.goto();
    await this.searchFor(set);

    const card = this.setCard(set);
    if (await card.isInCollection()) {
      await card.removeFromCollection();
    }
  }

  async clearWishlistIfPresent(set: TestSet) {
    await this.goto();
    await this.searchFor(set);
    await this.setCard(set).clearWishlistIfPresent();
  }
}
