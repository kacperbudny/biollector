import "server-only";
import { z } from "zod";
import { stackServerApp } from "@/auth/server";

export type User = {
  displayName: string | null;
};

export type UserRepositoryPort = {
  findById(userId: string): Promise<User | null>;
};

type UserLookup = {
  getUser(userId: string): Promise<{ displayName: string | null } | null>;
};

export class UserRepository implements UserRepositoryPort {
  constructor(private readonly lookup: UserLookup = stackServerApp) {}

  async findById(userId: string): Promise<User | null> {
    if (!z.uuid().safeParse(userId).success) {
      return null;
    }

    try {
      const user = await this.lookup.getUser(userId);
      if (!user) {
        return null;
      }

      return { displayName: user.displayName };
    } catch (error) {
      if (this.isMissingUserError(error)) {
        return null;
      }
      throw error;
    }
  }

  private isMissingUserError(error: unknown): boolean {
    if (!error || typeof error !== "object") {
      return false;
    }

    const statusCode = "statusCode" in error ? error.statusCode : undefined;
    return statusCode === 400 || statusCode === 404;
  }
}
