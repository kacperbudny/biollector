import { expect, type Locator, type Page } from "@playwright/test";

export class SetCard {
  private readonly root: Locator;

  constructor(
    private readonly page: Page,
    setName: string,
  ) {
    this.root = page.getByRole("group", { name: setName });
  }

  locator(): Locator {
    return this.root;
  }

  async addToCollection() {
    const addButton = this.root.getByRole("button", {
      name: "Add to collection",
    });
    await addButton.scrollIntoViewIfNeeded();
    await expect(addButton).toBeEnabled({ timeout: 15_000 });
    await addButton.click();
    await expect(
      this.root.getByRole("button", { name: "Remove from collection" }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async removeFromCollection() {
    const removeButton = this.root.getByRole("button", {
      name: "Remove from collection",
    });
    await removeButton.scrollIntoViewIfNeeded();
    await expect(removeButton).toBeEnabled({ timeout: 15_000 });
    await removeButton.click();

    const addButton = this.root.getByRole("button", {
      name: "Add to collection",
    });

    // On browse pages the card stays and the label flips; on collection (and
    // similar filtered views) the card may leave the list once removed.
    await expect(async () => {
      const addVisible = await addButton.isVisible();
      const cardVisible = await this.root.isVisible();
      expect(addVisible || !cardVisible).toBeTruthy();
    }).toPass({ timeout: 30_000 });
  }

  async isInCollection(): Promise<boolean> {
    return this.root
      .getByRole("button", { name: "Remove from collection" })
      .isVisible();
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

    const wishlistPicker = this.root.getByRole("group", {
      name: "Wishlist priority",
    });

    if (isMobile) {
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger).toBeEnabled({ timeout: 15_000 });
      await trigger.click();
      const dialog = this.page.getByRole("dialog", {
        name: "Wishlist priority",
      });
      await expect(dialog).toBeVisible();
      await dialog
        .getByRole("button", { name: optionLabel, exact: true })
        .click();
    } else {
      await wishlistPicker.scrollIntoViewIfNeeded();
      await wishlistPicker.hover({ force: true });
      await expect(option).toBeVisible();
      await expect(option).toBeEnabled({ timeout: 15_000 });
      await option.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
      // Move the pointer away so the desktop hover panel closes before the next interaction.
      await this.page.mouse.move(0, 0);
    }

    await expect(
      this.root.getByRole("button", { name: expectedTrigger }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async clearWishlistIfPresent() {
    const addButton = this.root.getByRole("button", {
      name: "Add set to wishlist",
    });

    if (await addButton.isVisible()) {
      return;
    }

    const wishlistTrigger = this.root.getByRole("button", {
      name: /^Wishlist: /,
    });

    if (!(await wishlistTrigger.isVisible())) {
      return;
    }

    const triggerLabel = await wishlistTrigger.getAttribute("aria-label");

    if (!triggerLabel) {
      return;
    }

    const optionLabel = triggerLabel.replace(/^Wishlist:\s*/, "");
    await this.setWishlistOption(triggerLabel, optionLabel);
  }

  async rate(stars: number) {
    const star = this.root.getByRole("button", {
      name: starLabel(stars),
      exact: true,
    });

    // The target star is already pressed when the current rating is higher, so
    // assert on the resulting rating. A click can also be swallowed when the
    // list re-renders underneath it, hence the retry.
    await expect(async () => {
      await expect(star).toBeEnabled();
      await star.scrollIntoViewIfNeeded();
      await star.click();
      await expect
        .poll(() => this.getCurrentRating(), { timeout: 5_000 })
        .toBe(stars);
    }).toPass({ timeout: 30_000 });

    // Stars are disabled until the write and its revalidation settle. Sorting
    // and filtering run client-side on the revalidated list, so interacting
    // before it lands leaves the rest of the page on the previous rating.
    await expect(star).toBeEnabled({ timeout: 30_000 });
    await expect
      .poll(() => this.getCurrentRating(), { timeout: 30_000 })
      .toBe(stars);
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
