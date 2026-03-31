// Implements: TASK-023 (REQ-024)

import { renderHook } from "@testing-library/react";
import { RepositoryProvider, useRepositories } from "./RepositoryContext";

describe("RepositoryContext", () => {
  it("throws when useRepositories is used outside RepositoryProvider", () => {
    expect(() => renderHook(() => useRepositories())).toThrow(
      /useRepositories must be used within RepositoryProvider/,
    );
  });

  it("returns all five repositories inside RepositoryProvider", () => {
    const { result } = renderHook(() => useRepositories(), {
      wrapper: RepositoryProvider,
    });

    expect(result.current.users).toBeDefined();
    expect(result.current.groups).toBeDefined();
    expect(result.current.expenses).toBeDefined();
    expect(result.current.settlements).toBeDefined();
    expect(result.current.activity).toBeDefined();
  });
});
