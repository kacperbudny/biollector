import { expect, test } from "@e2e/fixtures";
import { starLabel } from "@e2e/pages/ratings.page";
import { SET_HUKI } from "@e2e/test-data";

test("user sorts the sets catalog", async ({ page, setsPage }) => {
  test.setTimeout(90_000);

  await setsPage.goto();

  await setsPage.sortBy("Year");
  await expect(page).toHaveURL(/sort=year/);
  await setsPage.expectSortDirection("Ascending");
  await setsPage.expectFirstSectionHeading("2001");

  await setsPage.toggleSortDirection();
  await expect(page).toHaveURL(/dir=desc/);
  await setsPage.expectSortDirection("Descending");
  await setsPage.expectFirstSectionHeading("2026");

  await setsPage.sortBy("Set type");
  await expect(page).toHaveURL(/sort=set-type/);
  await setsPage.expectSortDirection("Ascending");
  await setsPage.expectFirstSectionHeading("Small");

  await setsPage.sortBy("Wave");
  await expect(page).toHaveURL(/sort=wave/);
  await setsPage.expectSortDirection("Ascending");
  await setsPage.expectFirstSectionHeading("Turaga");

  // User-specific sort: rate a set, then group by your rating.
  await setsPage.searchFor(SET_HUKI);
  const currentRating = await setsPage.setCard(SET_HUKI).getCurrentRating();
  const targetRating = currentRating === 5 ? 3 : 5;
  await setsPage.setCard(SET_HUKI).rate(targetRating);
  await setsPage.clearAllFilters();

  await setsPage.sortBy("Your rating");
  await expect(page).toHaveURL(/sort=user-rating/);
  await setsPage.expectSortDirection("Descending");

  await setsPage.searchFor(SET_HUKI);
  await setsPage.expectSetInSection(starLabel(targetRating), SET_HUKI);
});
