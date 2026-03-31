// Implements: TASK-008 (REQ-024)

import { User } from "@/types";

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(user: Omit<User, "id" | "createdAt">): Promise<User>;
  getAll(): Promise<User[]>;
}
