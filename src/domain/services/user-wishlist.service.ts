import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserWishlistRepositoryPort,
  userWishlistRepository,
} from "@/data/repositories/user-wishlist.repository";

export class UserWishlistService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly wishlistRepository: UserWishlistRepositoryPort,
  ) {}

  async toggleSet(userId: string, setNumber: string) {
    const set = this.setsRepository.findOne(setNumber);
    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    const isOnWishlist = await this.wishlistRepository.isOnWishlist(
      userId,
      setNumber,
    );

    if (isOnWishlist) {
      return await this.wishlistRepository.deleteFromWishlist(
        userId,
        setNumber,
      );
    }

    await this.wishlistRepository.insert(userId, setNumber);
  }
}

export const userWishlistService = new UserWishlistService(
  setsRepository,
  userWishlistRepository,
);
