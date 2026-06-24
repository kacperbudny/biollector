import { expect, type Page } from "@playwright/test";
import type { TestSet } from "../test-data";
import { SetCard } from "./set-card.page-object";

export class SetsListPageObject {
  constructor(protected readonly page: Page) {}

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

  hasSearchBox(): Promise<boolean> {
    return this.page
      .getByRole("searchbox", { name: "Search sets" })
      .isVisible({ timeout: 3000 })
      .catch(() => false);
  }
}
