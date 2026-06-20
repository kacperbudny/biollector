import { test } from "./fixtures";
import { starLabel } from "./pages/ratings.page";
import { SET_HUKI } from "./test-data";

test.describe.configure({ mode: "serial" });

test("user rates sets", async ({ setsPage, ratingsPage }) => {
  await ratingsPage.goto();
  const currentRating = await ratingsPage.readCurrentRating(SET_HUKI);

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
