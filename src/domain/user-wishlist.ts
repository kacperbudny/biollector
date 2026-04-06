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
