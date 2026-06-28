import { expect, type Page } from "@playwright/test";

export type NavLabel = "Sets" | "Collection" | "Wishlist" | "Ratings";

const NAV_PATHS: Record<NavLabel, string> = {
  Sets: "/sets",
  Collection: "/collection",
  Wishlist: "/wishlist",
  Ratings: "/ratings",
};

export class NavPageObject {
  constructor(protected readonly page: Page) {}

  async navigateTo(label: NavLabel) {
    await this.ensureAppLoaded();

    const openMenu = this.page.getByRole("button", { name: "Open menu" });

    if (await openMenu.isVisible()) {
      await openMenu.click();
    }

    await this.mainNavLink(label).click();
    await this.page.waitForURL(`**${NAV_PATHS[label]}`);
  }

  private mainNavLink(label: NavLabel) {
    return this.page
      .getByRole("navigation", { name: "Main navigation" })
      .filter({ visible: true })
      .getByRole("link", { name: label });
  }

  private async ensureAppLoaded() {
    const url = this.page.url();
    const hasLoadedApp = url !== "about:blank" && /^https?:\/\//.test(url);

    if (!hasLoadedApp) {
      await this.page.goto("/");
    }

    const mainNav = this.page
      .getByRole("navigation", { name: "Main navigation" })
      .filter({ visible: true });
    const openMenu = this.page.getByRole("button", { name: "Open menu" });

    await expect(mainNav.or(openMenu)).toBeVisible({ timeout: 15_000 });
  }
}
