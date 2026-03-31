// Implements: TASK-012 (REQ-015, REQ-023, REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ISettlementRepository } from "../interfaces/ISettlementRepository";
import type { Settlement } from "@/types";
import { settlementRowToSettlement, type SettlementRow } from "./mappers";
import { throwIfError } from "./postgrestError";

export class SupabaseSettlementRepository implements ISettlementRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Settlement | undefined> {
    const { data, error } = await this.client.from("settlements").select("*").eq("id", id).maybeSingle();
    throwIfError(error);
    if (!data) {
      return undefined;
    }
    return settlementRowToSettlement(data as SettlementRow);
  }

  async getByGroupId(groupId: string): Promise<Settlement[]> {
    const { data, error } = await this.client
      .from("settlements")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    throwIfError(error);
    return ((data as SettlementRow[] | null) ?? []).map(settlementRowToSettlement);
  }

  async create(settlement: Omit<Settlement, "id" | "createdAt">): Promise<Settlement> {
    const row = {
      group_id: settlement.groupId,
      from_user_id: settlement.fromUserId,
      to_user_id: settlement.toUserId,
      amount: settlement.amount,
      date: settlement.date,
    };
    const { data, error } = await this.client.from("settlements").insert(row).select("*").single();
    throwIfError(error);
    if (!data) {
      throw new Error("Settlement insert returned no row");
    }
    return settlementRowToSettlement(data as SettlementRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("settlements").delete().eq("id", id);
    throwIfError(error);
  }
}
