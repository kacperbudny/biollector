import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import type { TestSet } from "@e2e/test-data";

export class SetsPage extends SetsListPageObject {
  async goto() {
    await this.navigateTo("Sets");
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
