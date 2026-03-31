// Implements: TASK-005 (REQ-027, REQ-028)
import { ROUTES } from "./routes";

describe("ROUTES", () => {
  it("matches React Router paths from design.md §7", () => {
    expect(ROUTES.LANDING).toBe("/");
    expect(ROUTES.HOME).toBe("/home");
    expect(ROUTES.GROUPS).toBe("/groups");
    expect(ROUTES.GROUP_DETAIL("abc")).toBe("/groups/abc");
    expect(ROUTES.ADD_EXPENSE).toBe("/expenses/new");
    expect(ROUTES.EDIT_EXPENSE("e1")).toBe("/expenses/e1/edit");
    expect(ROUTES.ACTIVITY).toBe("/activity");
    expect(ROUTES.SETTINGS).toBe("/settings");
  });
});
