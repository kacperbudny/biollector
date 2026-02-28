import { vi } from "vitest";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";

export function userCollectionRepositoryMock(overrides?: {
  setNumbers?: string[];
}): UserCollectionRepositoryPort {
  return {
    insert: vi.fn().mockResolvedValue(undefined),
    deleteByUserAndSet: vi.fn().mockResolvedValue(undefined),
    getSetNumbersByUserId: vi
      .fn()
      .mockResolvedValue(overrides?.setNumbers ?? []),
  };
}
