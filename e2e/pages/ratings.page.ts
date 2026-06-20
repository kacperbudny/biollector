import { expect } from "@playwright/test";
import type { TestSet } from "../test-data";
import { SetsListPageObject } from "./sets-list.page-object";

export class RatingsPage extends SetsListPageObject {
  async goto() {
    await this.page.goto("/ratings");
  }

  async expectSection(starLabel: string) {
    const heading = this.page.getByRole("heading", { name: starLabel });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  }

  async readCurrentRating(set: TestSet): Promise<number | null> {
    if (!(await this.hasSearchBox())) {
      return null;
    }

    await this.searchFor(set);
    return this.setCard(set).getCurrentRating();
  }
}

function starLabel(stars: number): string {
  return `${stars} star${stars !== 1 ? "s" : ""}`;
}

export { starLabel };
