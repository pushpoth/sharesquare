// Implements: REQ-024 (IndexedDB implementation; Supabase: TASK-009)

import type { ShareSquareDB } from "./database";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { User } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { toISOTimestamp } from "@/utils/dateUtils";
import { DuplicateError } from "../errors";

export class DexieUserRepository implements IUserRepository {
  constructor(private readonly db: ShareSquareDB) {}

  async findById(id: string): Promise<User | undefined> {
    return this.db.users.get(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.users.where("email").equals(email).first();
  }

  async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const existing = await this.findByEmail(user.email);
    if (existing) {
      throw new DuplicateError(`User with email ${user.email} already exists`);
    }
    const id = generateId();
    const createdAt = toISOTimestamp();
    const newUser: User = { ...user, id, createdAt };
    await this.db.users.put(newUser);
    return newUser;
  }

  async getAll(): Promise<User[]> {
    return this.db.users.toArray();
  }
}
