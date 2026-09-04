import { expect, test } from "@e2e/fixtures";

test("user can share a public profile link", async ({
  collectionPage,
  publicProfilePage,
  page,
}) => {
  await collectionPage.goto();
  const profileUrl = await collectionPage.copyProfileLink();
  expect(profileUrl).toMatch(/\/u\/[^/?]+$/);

  await page.goto(profileUrl);
  await publicProfilePage.expectLoaded();
  await publicProfilePage.expectCollectionTab();
  await publicProfilePage.expectReadOnlyCards();

  await publicProfilePage.openWishlistTab();
  await publicProfilePage.expectReadOnlyCards();
});
