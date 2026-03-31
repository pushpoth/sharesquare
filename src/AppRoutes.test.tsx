// Implements: TASK-001 (REQ-026, REQ-027)
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "@/app/providers";
import { AppRoutes } from "@/AppRoutes";

describe("AppRoutes", () => {
  it("renders login route at /", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Providers>
          <AppRoutes />
        </Providers>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });
});
