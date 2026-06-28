import { NavPageObject } from "@e2e/pages/nav.page-object";
import { SetCard } from "@e2e/pages/set-card.page-object";
import type { TestSet } from "@e2e/test-data";
import { expect } from "@playwright/test";

export class SetsListPageObject extends NavPageObject {
  setCard(set: TestSet | string): SetCard {
    const setName = typeof set === "string" ? set : set.name;
    return new SetCard(this.page, setName);
  }

  async searchFor(set: TestSet) {
    const searchbox = this.page.getByRole("searchbox", { name: "Search sets" });
    await expect(searchbox).toBeVisible({ timeout: 10_000 });
    await searchbox.click();
    await searchbox.fill(set.catalog);
    await expect(searchbox).toHaveValue(set.catalog);

    await expect(this.page.getByText(/Showing \d+ of \d+ sets/)).toBeVisible({
      timeout: 15_000,
    });

    await expect(async () => {
      const card = this.setCard(set);
      await expect(card.locator()).toBeVisible();
      await card.locator().scrollIntoViewIfNeeded();
    }).toPass({ timeout: 15_000 });
  }

  async expectSetVisible(set: TestSet) {
    await expect(this.page.getByText(set.name)).toBeVisible();
    await expect(this.page.getByText(set.catalog)).toBeVisible();
  }
}
