// Implements: TASK-052 (REQ-001, REQ-024, REQ-025)

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";

jest.mock("@/app/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-landing" />,
}));
jest.mock("@/app/home/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-home" />,
}));
jest.mock("@/app/activity/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-activity" />,
}));
jest.mock("@/app/settings/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-settings" />,
}));
jest.mock("@/app/groups/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-groups" />,
}));
jest.mock("@/app/groups/[id]/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-group-detail" />,
}));
jest.mock("@/app/expenses/new/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-add-expense" />,
}));
jest.mock("@/app/expenses/[id]/edit/page", () => ({
  __esModule: true,
  default: () => <div data-testid="route-edit-expense" />,
}));

describe("AppRoutes (TASK-052)", () => {
  const cases: [string, string][] = [
    ["/", "route-landing"],
    ["/home", "route-home"],
    ["/activity", "route-activity"],
    ["/settings", "route-settings"],
    ["/groups", "route-groups"],
    ["/groups/g1", "route-group-detail"],
    ["/expenses/new", "route-add-expense"],
    ["/expenses/e1/edit", "route-edit-expense"],
  ];

  it.each(cases)("path %s renders stub page", (path, testId) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
