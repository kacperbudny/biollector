import { CollectionPage } from "@e2e/pages/collection.page";
import { PublicProfilePage } from "@e2e/pages/public-profile.page";
import { RatingsPage } from "@e2e/pages/ratings.page";
import { SetsPage } from "@e2e/pages/sets.page";
import { WishlistPage } from "@e2e/pages/wishlist.page";
import { test as base } from "@playwright/test";

type PageFixtures = {
  setsPage: SetsPage;
  collectionPage: CollectionPage;
  wishlistPage: WishlistPage;
  ratingsPage: RatingsPage;
  publicProfilePage: PublicProfilePage;
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
  publicProfilePage: async ({ page }, use) => {
    await use(new PublicProfilePage(page));
  },
});

export { expect } from "@playwright/test";
