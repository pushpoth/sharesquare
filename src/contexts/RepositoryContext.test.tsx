// Implements: TASK-023 (REQ-024)

import React from "react";
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

  it("uses the optional value override when provided (tests)", () => {
    const custom = {
      users: { findById: jest.fn(), findByEmail: jest.fn(), create: jest.fn(), getAll: jest.fn() },
      groups: {
        findById: jest.fn(),
        findByInviteCode: jest.fn(),
        getByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addMember: jest.fn(),
        getMembers: jest.fn(),
        isMember: jest.fn(),
      },
      expenses: {
        findById: jest.fn(),
        getByGroupId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getPayers: jest.fn(),
        getSplits: jest.fn(),
      },
      settlements: {
        findById: jest.fn(),
        getByGroupId: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      activity: { log: jest.fn(), getByUserId: jest.fn() },
    };

    const { result } = renderHook(() => useRepositories(), {
      wrapper: ({ children }) => <RepositoryProvider value={custom}>{children}</RepositoryProvider>,
    });

    expect(result.current.users).toBe(custom.users);
  });
});
