import { z } from "zod";

export enum UserWishlistScale {
  NOT_INTERESTED = 0,
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  MUST_HAVE = 5,
}

export const userWishlistScaleSchema = z.enum(UserWishlistScale);

const WISHLIST_SCALE_LABELS: Record<UserWishlistScale, string> = {
  [UserWishlistScale.NOT_INTERESTED]: "Not interested",
  [UserWishlistScale.VERY_LOW]: "Very low priority",
  [UserWishlistScale.LOW]: "Low priority",
  [UserWishlistScale.MEDIUM]: "Medium priority",
  [UserWishlistScale.HIGH]: "High priority",
  [UserWishlistScale.MUST_HAVE]: "Must have",
};

export function getWishlistScaleLabel(scale: UserWishlistScale): string {
  return WISHLIST_SCALE_LABELS[scale];
}
