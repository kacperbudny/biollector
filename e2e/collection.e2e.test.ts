import { test } from "./fixtures";
import { SET_HUKI } from "./test-data";

test.describe.configure({ mode: "serial" });

test("user manages their set collection", async ({
  setsPage,
  collectionPage,
}) => {
  await setsPage.removeFromCollectionIfPresent(SET_HUKI);

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
