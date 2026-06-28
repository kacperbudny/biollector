import { test } from "@e2e/fixtures";
import { SET_HUKI } from "@e2e/test-data";

test.beforeEach(async ({ setsPage }) => {
  await setsPage.removeFromCollectionIfPresent(SET_HUKI);
});

test("user manages their set collection", async ({
  setsPage,
  collectionPage,
}) => {
  await collectionPage.goto();
  await collectionPage.expectEmpty();

  await setsPage.goto();
  await setsPage.searchFor(SET_HUKI);
  await setsPage.setCard(SET_HUKI).addToCollection();

  await collectionPage.goto();
  await collectionPage.searchFor(SET_HUKI);
  await collectionPage.expectSetVisible(SET_HUKI);

  await collectionPage.setCard(SET_HUKI).removeFromCollection();
  await collectionPage.expectEmpty();
});
