// Implements: TASK-009 (REQ-001, REQ-002, REQ-023, REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { User } from "@/types";
import { ValidationError } from "../errors";
import { profileRowToUser, type ProfileRow } from "./mappers";
import { throwIfError } from "./postgrestError";

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<User | undefined> {
    const { data, error } = await this.client.from("profiles").select("*").eq("id", id).maybeSingle();
    throwIfError(error);
    if (!data) {
      return undefined;
    }
    return profileRowToUser(data as ProfileRow);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.client.from("profiles").select("*").eq("email", email).maybeSingle();
    throwIfError(error);
    if (!data) {
      return undefined;
    }
    return profileRowToUser(data as ProfileRow);
  }

  /**
   * Inserts a row for the **current** `auth.users` id (profiles PK). Call after sign-in;
   * server-side triggers may also create profiles (TASK-055).
   */
  async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const {
      data: { user: authUser },
      error: authErr,
    } = await this.client.auth.getUser();
    if (authErr || !authUser) {
      throw new ValidationError("Must be signed in to create a profile");
    }
    const insertRow = {
      id: authUser.id,
      email: user.email,
      display_name: user.name,
      avatar_url: user.avatarUrl,
    };
    const { data, error } = await this.client.from("profiles").insert(insertRow).select("*").single();
    throwIfError(error);
    if (!data) {
      throw new Error("Profile insert returned no row");
    }
    return profileRowToUser(data as ProfileRow);
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await this.client.from("profiles").select("*");
    throwIfError(error);
    return (data as ProfileRow[] | null)?.map(profileRowToUser) ?? [];
  }
}
