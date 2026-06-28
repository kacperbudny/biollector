import { SetsListPageObject } from "@e2e/pages/sets-list.page-object";
import type { TestSet } from "@e2e/test-data";
import { expect } from "@playwright/test";

export class RatingsPage extends SetsListPageObject {
  async goto() {
    await this.navigateTo("Ratings");
  }

  async expectSection(starLabel: string) {
    const heading = this.page.getByRole("heading", { name: starLabel });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  }

  async readCurrentRating(set: TestSet): Promise<number | null> {
    if (await this.hasNoRatings()) {
      return null;
    }

    await this.searchFor(set);
    return this.setCard(set).getCurrentRating();
  }

  private hasNoRatings(): Promise<boolean> {
    return this.page
      .getByText("You have not rated any sets yet")
      .isVisible({ timeout: 3_000 });
  }
}

function starLabel(stars: number): string {
  return `${stars} star${stars !== 1 ? "s" : ""}`;
}

export { starLabel };
