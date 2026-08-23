import { expect, test } from "@e2e/fixtures";
import { SET_HUKI, SET_JALA, SET_JALLER_AND_GUKKO } from "@e2e/test-data";

test.beforeEach(async ({ setsPage }) => {
  await setsPage.removeFromCollectionIfPresent(SET_HUKI);
});

test.afterEach(async ({ setsPage }) => {
  await setsPage.removeFromCollectionIfPresent(SET_HUKI);
});

test("user filters and searches the sets catalog", async ({
  page,
  setsPage,
}) => {
  test.setTimeout(90_000);

  await setsPage.goto();

  // Partial character/name search — "jall" matches Jala, Jaller sets, etc.
  await setsPage.search("jall");
  await expect(page.getByText(/Showing 9 of \d+ sets/)).toBeVisible();
  await setsPage.expectSetVisible(SET_JALA);
  await setsPage.expectSetVisible(SET_JALLER_AND_GUKKO);
  await setsPage.expectSetHidden(SET_HUKI);

  await setsPage.clearAllFilters();

  await setsPage.selectFilterOption("Wave", "Tohunga");
  await expect(page).toHaveURL(/waves=Tohunga/);
  await setsPage.expectSetVisible(SET_HUKI);

  await setsPage.clearAllFilters();

  await setsPage.selectFilterOption("Release year", "2026");
  await expect(page).toHaveURL(/years=2026/);
  await setsPage.expectSectionHeading("2026");
  await setsPage.expectSetHidden(SET_HUKI);

  await setsPage.clearAllFilters();

  await setsPage.searchFor(SET_HUKI);
  await setsPage.setCard(SET_HUKI).addToCollection();
  await setsPage.clearAllFilters();

  await setsPage.selectCollectionFilter("In collection");
  await expect(page).toHaveURL(/collection=in/);
  await setsPage.expectSetVisible(SET_HUKI);

  await setsPage.selectCollectionFilter("Not in collection");
  await expect(page).toHaveURL(/collection=not-in/);
  await setsPage.expectSetHidden(SET_HUKI);
});
