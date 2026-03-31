// Implements: TASK-004 (REQ-023, REQ-024)
import { ACTIVITY_TYPES, type ActivityType } from "./activity";

describe("ACTIVITY_TYPES", () => {
  it("lists every ActivityType from design.md §6", () => {
    expect(ACTIVITY_TYPES).toHaveLength(6);
    const set = new Set<ActivityType>(ACTIVITY_TYPES);
    expect(set.size).toBe(6);
  });

  it("includes all expected keys", () => {
    expect(ACTIVITY_TYPES).toEqual(
      expect.arrayContaining([
        "expense_added",
        "expense_edited",
        "expense_deleted",
        "settlement_added",
        "member_joined",
        "group_created",
      ]),
    );
  });
});
