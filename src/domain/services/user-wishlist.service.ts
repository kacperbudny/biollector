import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserWishlistRepositoryPort,
  userWishlistRepository,
} from "@/data/repositories/user-wishlist.repository";
import type { UserWishlistScale } from "@/domain/user-wishlist";

export class UserWishlistService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly wishlistRepository: UserWishlistRepositoryPort,
  ) {}

  async setWishlist(
    userId: string,
    setNumber: string,
    scale: UserWishlistScale | null,
  ): Promise<void> {
    const set = this.setsRepository.findOne(setNumber);
    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    if (scale === null) {
      await this.wishlistRepository.deleteFromWishlist(userId, setNumber);
      return;
    }

    await this.wishlistRepository.setWishlist(userId, setNumber, scale);
  }
}

export const userWishlistService = new UserWishlistService(
  setsRepository,
  userWishlistRepository,
);
