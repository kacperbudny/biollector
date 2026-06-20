import { test as base } from "@playwright/test";
import { CollectionPage } from "./pages/collection.page";
import { RatingsPage } from "./pages/ratings.page";
import { SetsPage } from "./pages/sets.page";
import { WishlistPage } from "./pages/wishlist.page";

type PageFixtures = {
  setsPage: SetsPage;
  collectionPage: CollectionPage;
  wishlistPage: WishlistPage;
  ratingsPage: RatingsPage;
};

export const test = base.extend<PageFixtures>({
  setsPage: async ({ page }, use) => {
    await use(new SetsPage(page));
  },
  collectionPage: async ({ page }, use) => {
    await use(new CollectionPage(page));
  },
  wishlistPage: async ({ page }, use) => {
    await use(new WishlistPage(page));
  },
  ratingsPage: async ({ page }, use) => {
    await use(new RatingsPage(page));
  },
});

export { expect } from "@playwright/test";
