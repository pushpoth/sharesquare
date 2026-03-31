// Implements: TASK-005 (REQ-027, REQ-028)
import { COLORS } from "./colors";

describe("COLORS", () => {
  it("exposes hex tokens aligned with Tailwind theme", () => {
    expect(COLORS.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(COLORS.primaryDark).toBe("#4A5A3C");
    expect(COLORS.accent).toBe("#6B8F71");
    expect(COLORS.surface).toBe("#FFFFFF");
  });
});
