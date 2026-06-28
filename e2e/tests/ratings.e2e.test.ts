import { test } from "@e2e/fixtures";
import { starLabel } from "@e2e/pages/ratings.page";
import { SET_HUKI } from "@e2e/test-data";

test("user rates sets", async ({ setsPage, ratingsPage }) => {
  await ratingsPage.goto();
  const currentRating = await ratingsPage.readCurrentRating(SET_HUKI);

  // we want to rate a set to a different star rating than the current one
  const targetRating = currentRating === 3 ? 5 : 3;
  const targetLabel = starLabel(targetRating);

  await setsPage.goto();
  await setsPage.searchFor(SET_HUKI);
  await setsPage.setCard(SET_HUKI).rate(targetRating);

  await ratingsPage.goto();
  await ratingsPage.expectSection(targetLabel);

  await ratingsPage.searchFor(SET_HUKI);
  await ratingsPage.expectSetVisible(SET_HUKI);
});
