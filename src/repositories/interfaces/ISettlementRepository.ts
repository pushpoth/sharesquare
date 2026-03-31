// Implements: TASK-008 (REQ-024)

import { Settlement } from "@/types";

export interface ISettlementRepository {
  findById(id: string): Promise<Settlement | undefined>;
  getByGroupId(groupId: string): Promise<Settlement[]>;
  create(settlement: Omit<Settlement, "id" | "createdAt">): Promise<Settlement>;
  delete(id: string): Promise<void>;
}
