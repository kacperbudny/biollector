import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import type { TestSet } from "@e2e/test-data";
import { expect, type Locator } from "@playwright/test";

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

  async selectFilterOption(filterLabel: string, optionLabel: string) {
    await this.openFiltersIfNeeded();
    const root = await this.filterRoot();

    const placeholder = FILTER_PLACEHOLDERS[filterLabel];
    if (!placeholder) {
      throw new Error(`Unknown filter label: ${filterLabel}`);
    }

    // Click the trigger group (the nested listbox button is a zero-sized chevron).
    const trigger = root.locator('[data-slot="autocomplete-trigger"]').filter({
      hasText: placeholder,
    });
    await expect(trigger).toBeVisible({ timeout: 10_000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const listbox = this.page.getByRole("listbox", { name: filterLabel });
    await expect(listbox).toBeVisible({ timeout: 10_000 });

    const option = listbox.getByRole("option", {
      name: optionLabel,
      exact: true,
    });
    await option.scrollIntoViewIfNeeded();
    await option.click();

    await expect(
      root.locator('[data-slot="autocomplete-trigger"]').filter({
        hasText: optionLabel,
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Multi-select autocomplete stays open; dismiss so it doesn't block later clicks.
    await this.page.keyboard.press("Escape");
    await expect(listbox).toBeHidden({ timeout: 10_000 });

    await this.closeFiltersIfOpen();
    await this.expectFilteringActive();
  }

  async selectCollectionFilter(option: "In collection" | "Not in collection") {
    await this.openFiltersIfNeeded();
    const root = await this.filterRoot();

    const toggle = root.getByRole("radio", { name: option, exact: true });
    await expect(toggle).toBeVisible({ timeout: 10_000 });
    await toggle.click();

    await this.closeFiltersIfOpen();
    await this.expectFilteringActive();
  }

  async clearAllFilters() {
    await this.openFiltersIfNeeded();
    const clearButton = (await this.filterRoot()).getByRole("button", {
      name: "Clear all",
    });
    await expect(clearButton).toBeEnabled({ timeout: 10_000 });
    await clearButton.click();
    await this.expectFilteringInactive();
  }

  private async openFiltersIfNeeded() {
    const openFilters = this.page
      .getByRole("button", { name: /^Filters/ })
      .filter({ visible: true });

    if (await openFilters.isVisible()) {
      await openFilters.click();
      await expect(this.mobileFiltersDialog()).toBeVisible({ timeout: 10_000 });
    }
  }

  private async closeFiltersIfOpen() {
    const dialog = this.mobileFiltersDialog();
    if (!(await dialog.isVisible())) {
      return;
    }

    const closeButton = dialog.getByRole("button", { name: /close/i }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press("Escape");
    }

    await expect(dialog).toBeHidden({ timeout: 10_000 });
  }

  private async filterRoot(): Promise<Locator> {
    const dialog = this.mobileFiltersDialog();
    if (await dialog.isVisible()) {
      return dialog;
    }

    return this.page.getByRole("complementary", { name: "Filters" });
  }

  private mobileFiltersDialog(): Locator {
    return this.page.getByRole("dialog", { name: "Filters" });
  }
}

const FILTER_PLACEHOLDERS: Record<string, string> = {
  "Release year": "Select year(s)",
  "Set type": "Select type(s)",
  Wave: "Select wave(s)",
  Character: "Select character(s)",
  "Average rating": "Select rating(s)",
  Wishlist: "Select priority",
  "Your rating": "Select rating(s)",
};
