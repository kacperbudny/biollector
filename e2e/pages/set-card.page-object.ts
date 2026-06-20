import { expect, type Locator, type Page } from "@playwright/test";

export class SetCard {
  private readonly root: Locator;

  constructor(
    private readonly page: Page,
    setName: string,
  ) {
    this.root = page
      .getByRole("heading", { name: setName, level: 3 })
      .locator(
        'xpath=ancestor::div[contains(@class,"overflow-hidden") and contains(@class,"border")]',
      );
  }

  locator(): Locator {
    return this.root;
  }

  async addToCollection() {
    await this.root.getByRole("button", { name: "Add to collection" }).click();
    await expect(
      this.root.getByRole("button", { name: "Remove from collection" }),
    ).toBeVisible();
  }

  async removeFromCollection() {
    await this.root
      .getByRole("button", { name: "Remove from collection" })
      .click();
  }

  async isInCollection(): Promise<boolean> {
    return this.root
      .getByRole("button", { name: "Remove from collection" })
      .isVisible()
      .catch(() => false);
  }

  async setWishlistOption(triggerLabel: string | RegExp, optionLabel: string) {
    const isRemoving =
      typeof triggerLabel === "string" &&
      triggerLabel === `Wishlist: ${optionLabel}`;
    const expectedTrigger = isRemoving
      ? "Add set to wishlist"
      : `Wishlist: ${optionLabel}`;

    const isMobile = (this.page.viewportSize()?.width ?? 1024) < 768;
    const trigger = this.root.getByRole("button", { name: triggerLabel });

    const option = this.root.getByRole("button", {
      name: optionLabel,
      exact: true,
    });

    const wishlistPicker = this.root.locator(".aspect-square .group");

    if (isMobile) {
      await trigger.click();
      await option.click();
    } else {
      const actionDone = this.page.waitForResponse(
        (response) => response.request().method() === "POST" && response.ok(),
        { timeout: 15_000 },
      );

      await wishlistPicker.hover({ force: true });
      await expect(option).toBeVisible();
      await option.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
      await actionDone;
      await this.page.mouse.move(0, 0);
    }

    await expect(
      this.root.getByRole("button", { name: expectedTrigger }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async clearWishlistIfPresent() {
    if (
      await this.root
        .getByRole("button", { name: "Add set to wishlist" })
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    const triggerLabel = await this.root
      .locator('[aria-label^="Wishlist:"]')
      .first()
      .getAttribute("aria-label");

    if (!triggerLabel) {
      return;
    }

    const optionLabel = triggerLabel.replace(/^Wishlist:\s*/, "");
    await this.setWishlistOption(triggerLabel, optionLabel);
  }

  async rate(stars: number) {
    const label = starLabel(stars);
    const star = this.root.getByRole("button", { name: label, exact: true });
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === "POST" && response.ok(),
      { timeout: 15_000 },
    );

    await star.click();
    await actionDone;
    await expect(
      this.root.getByRole("button", {
        name: label,
        exact: true,
        pressed: true,
      }),
    ).toBeVisible();
  }

  async getCurrentRating(): Promise<number | null> {
    for (let stars = 5; stars >= 1; stars--) {
      const pressedCount = await this.root
        .getByRole("button", {
          name: starLabel(stars),
          exact: true,
          pressed: true,
        })
        .count();
      if (pressedCount > 0) {
        return stars;
      }
    }
    return null;
  }
}

function starLabel(stars: number): string {
  return `${stars} star${stars !== 1 ? "s" : ""}`;
}
