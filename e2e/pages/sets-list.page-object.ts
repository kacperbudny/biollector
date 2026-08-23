import { NavPageObject } from "@e2e/pages/nav.page-object";
import { SetCard } from "@e2e/pages/set-card.page-object";
import type { TestSet } from "@e2e/test-data";
import { expect, type Locator } from "@playwright/test";

export class SetsListPageObject extends NavPageObject {
  setCard(set: TestSet | string): SetCard {
    const setName = typeof set === "string" ? set : set.name;
    return new SetCard(this.page, setName);
  }

  async search(query: string) {
    const searchbox = this.visibleSearchbox();
    await expect(searchbox).toBeVisible({ timeout: 10_000 });
    await searchbox.click();
    await searchbox.fill(query);
    await expect(searchbox).toHaveValue(query);
    await this.expectFilteringActive();
  }

  async searchFor(set: TestSet) {
    await this.search(set.catalog);

    await expect(async () => {
      const card = this.setCard(set);
      await expect(card.locator()).toBeVisible();
      await card.locator().scrollIntoViewIfNeeded();
    }).toPass({ timeout: 15_000 });
  }

  async expectSetVisible(set: TestSet) {
    await expect(async () => {
      const card = this.setCard(set);
      await expect(card.locator()).toBeVisible();
      await card.locator().scrollIntoViewIfNeeded();
    }).toPass({ timeout: 15_000 });
    await expect(this.page.getByText(set.catalog)).toBeVisible();
  }

  async expectSetInSection(section: string, set: TestSet) {
    await expect(async () => {
      const heading = this.listSectionHeadings().filter({ hasText: section });
      await expect(heading.first()).toBeVisible();
      await heading.first().scrollIntoViewIfNeeded();
    }).toPass({ timeout: 15_000 });
    await this.expectSetVisible(set);
  }

  async expectSetHidden(set: TestSet) {
    await expect(this.setCard(set).locator()).toBeHidden({ timeout: 15_000 });
  }

  async expectFilteringActive() {
    await expect(this.page.getByText(/Showing \d+ of \d+ sets/)).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectFilteringInactive() {
    await expect(this.page.getByText(/Showing \d+ of \d+ sets/)).toBeHidden({
      timeout: 15_000,
    });
  }

  async expectNoResults() {
    await expect(
      this.page.getByText("No sets found for the current filters."),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectSectionHeading(label: string | RegExp) {
    const heading = this.listSectionHeadings().filter({ hasText: label });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
  }

  async expectFirstSectionHeading(label: string | RegExp) {
    await expect(this.listSectionHeadings().first()).toHaveText(label, {
      timeout: 15_000,
    });
  }

  private listSectionHeadings(): Locator {
    return this.page
      .getByRole("heading", { level: 2 })
      .filter({ hasNotText: "Filters" });
  }

  async sortBy(optionLabel: string) {
    const sortSelect = this.page.getByRole("button", { name: "Sort sets by" });
    await expect(sortSelect).toBeVisible({ timeout: 10_000 });
    await sortSelect.click();

    const options = this.page.getByRole("listbox", { name: "Sort options" });
    await expect(options).toBeVisible();
    await options
      .getByRole("option", { name: optionLabel, exact: true })
      .click();

    await expect(sortSelect).toContainText(optionLabel, { timeout: 10_000 });
  }

  async toggleSortDirection() {
    const directionButton = this.page.getByRole("button", {
      name: /Sort direction:/,
    });
    await expect(directionButton).toBeVisible();
    const previousLabel = await directionButton.getAttribute("aria-label");
    await directionButton.click();
    await expect(directionButton).not.toHaveAttribute(
      "aria-label",
      previousLabel ?? "",
    );
  }

  async expectSortDirection(direction: "Ascending" | "Descending") {
    await expect(
      this.page.getByRole("button", {
        name: new RegExp(`Sort direction: ${direction}`),
      }),
    ).toBeVisible();
  }

  protected visibleSearchbox(): Locator {
    return this.page
      .getByRole("searchbox", { name: "Search sets" })
      .filter({ visible: true });
  }
}
