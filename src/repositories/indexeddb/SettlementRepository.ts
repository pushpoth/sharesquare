// Implements: TASK-012 (REQ-024)

import type { ShareSquareDB } from "./database";
import type { ISettlementRepository } from "../interfaces/ISettlementRepository";
import type { Settlement } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { toISOTimestamp } from "@/utils/dateUtils";

export class DexieSettlementRepository implements ISettlementRepository {
  constructor(private readonly db: ShareSquareDB) {}

  async findById(id: string): Promise<Settlement | undefined> {
    return this.db.settlements.get(id);
  }

  async getByGroupId(groupId: string): Promise<Settlement[]> {
    const settlements = await this.db.settlements.where("groupId").equals(groupId).sortBy("date");
    return settlements.reverse();
  }

  async create(settlement: Omit<Settlement, "id" | "createdAt">): Promise<Settlement> {
    const id = generateId();
    const createdAt = toISOTimestamp();
    const newSettlement: Settlement = { ...settlement, id, createdAt };
    await this.db.settlements.put(newSettlement);
    return newSettlement;
  }

  async delete(id: string): Promise<void> {
    await this.db.settlements.delete(id);
  }
}
