import { vi } from "vitest";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";

export function userCollectionRepositoryMock(
  overrides?: Partial<UserCollectionRepositoryPort>,
): UserCollectionRepositoryPort {
  return {
    insert: vi.fn(),
    deleteFromCollection: vi.fn(),
    getUserCollection: vi.fn(),
    isInCollection: vi.fn(),
    ...overrides,
  };
}
