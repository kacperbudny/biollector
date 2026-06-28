import { test } from "@e2e/fixtures";
import { SET_HUKI, SET_ONEPU } from "@e2e/test-data";

test.beforeEach(async ({ setsPage }) => {
  await setsPage.clearWishlistIfPresent(SET_HUKI);
  await setsPage.clearWishlistIfPresent(SET_ONEPU);
});

test("user manages their wishlist", async ({ setsPage, wishlistPage }) => {
  await wishlistPage.goto();
  await wishlistPage.expectEmpty();

  await setsPage.goto();
  await setsPage.searchFor(SET_HUKI);
  await setsPage
    .setCard(SET_HUKI)
    .setWishlistOption("Add set to wishlist", "Must have");

  await setsPage.searchFor(SET_ONEPU);
  await setsPage
    .setCard(SET_ONEPU)
    .setWishlistOption("Add set to wishlist", "Not interested");

  await wishlistPage.goto();
  await wishlistPage.expectSetInSection("Must have", SET_HUKI);
  await wishlistPage.expectSetInSection("Not interested", SET_ONEPU);

  await wishlistPage.searchFor(SET_HUKI);
  await wishlistPage
    .setCard(SET_HUKI)
    .setWishlistOption("Wishlist: Must have", "Must have");

  await wishlistPage.searchFor(SET_ONEPU);
  await wishlistPage
    .setCard(SET_ONEPU)
    .setWishlistOption("Wishlist: Not interested", "Not interested");

  await wishlistPage.goto();
  await wishlistPage.expectEmpty();
});
