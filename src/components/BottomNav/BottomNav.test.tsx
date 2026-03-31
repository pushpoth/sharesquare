// Implements: TASK-029 (REQ-019, REQ-027)

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { NAV_ITEMS } from "./constants";
import { ROUTES } from "@/constants/routes";

function renderWithRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe("BottomNav", () => {
  it("defines five items whose hrefs match ROUTES", () => {
    expect(NAV_ITEMS).toHaveLength(5);
    const hrefs = new Set(NAV_ITEMS.map((i) => i.href));
    expect(hrefs.has(ROUTES.HOME)).toBe(true);
    expect(hrefs.has(ROUTES.GROUPS)).toBe(true);
    expect(hrefs.has(ROUTES.ADD_EXPENSE)).toBe(true);
    expect(hrefs.has(ROUTES.ACTIVITY)).toBe(true);
    expect(hrefs.has(ROUTES.SETTINGS)).toBe(true);
  });

  it("renders FAB linking to add expense route", () => {
    renderWithRoute("/home");
    const fab = screen.getByTestId("bottom-nav-add-expense");
    expect(fab).toHaveAttribute("href", ROUTES.ADD_EXPENSE);
  });

  it("marks dashboard active on /home", () => {
    renderWithRoute("/home");
    const dash = screen.getByTestId("bottom-nav-link-dashboard");
    expect(dash.className).toContain("text-white");
    expect(dash.className).not.toContain("text-white/60");
  });

  it("marks groups active on group detail path", () => {
    renderWithRoute("/groups/abc-123");
    const groups = screen.getByTestId("bottom-nav-link-groups");
    expect(groups.className).toContain("text-white");
    expect(groups.className).not.toContain("text-white/60");
  });

  it("does not mark dashboard active on /groups", () => {
    renderWithRoute("/groups");
    const dash = screen.getByTestId("bottom-nav-link-dashboard");
    expect(dash.className).toContain("text-white/60");
  });
});
