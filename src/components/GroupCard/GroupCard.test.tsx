// Implements: TASK-033 (REQ-005, REQ-027)

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Group } from "@/types/group";
import { ROUTES } from "@/constants/routes";
import { GroupCard } from "./GroupCard";

const sampleGroup: Group = {
  id: "group-uuid-1",
  name: "Roommates",
  inviteCode: "ABCD-1234",
  createdBy: "u1",
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("GroupCard", () => {
  function renderCard(props: Partial<ComponentProps<typeof GroupCard>> = {}) {
    return render(
      <MemoryRouter>
        <GroupCard
          group={sampleGroup}
          members={[{ name: "A" }, { name: "B" }]}
          totalExpenses={1200}
          userBalance={-500}
          {...props}
        />
      </MemoryRouter>,
    );
  }

  it("uses data-testid with group id", () => {
    renderCard();
    expect(screen.getByTestId(`group-card-${sampleGroup.id}`)).toBeInTheDocument();
  });

  it("links to group detail route", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /Roommates/i });
    expect(link).toHaveAttribute("href", ROUTES.GROUP_DETAIL(sampleGroup.id));
  });

  it("shows owed copy when balance is non-negative", () => {
    renderCard({ userBalance: 300 });
    expect(screen.getByText(/YOU ARE OWED/)).toBeInTheDocument();
  });
});
