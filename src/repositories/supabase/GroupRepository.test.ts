// Implements: TASK-010 (REQ-024), TASK-058 (REQ-031)

import type { SupabaseClient } from "@supabase/supabase-js";
import { DuplicateError } from "../errors";
import { SupabaseGroupRepository } from "./GroupRepository";

const groupRow = {
  id: "g1",
  name: "Trip",
  invite_code: "ABC123",
  created_by: "u1",
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("SupabaseGroupRepository", () => {
  it("findByInviteCode calls find_group_by_invite_code RPC with trimmed code", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: [groupRow], error: null });
    const client = { rpc } as unknown as SupabaseClient;
    const repo = new SupabaseGroupRepository(client);

    const g = await repo.findByInviteCode("  abc123  ");
    expect(rpc).toHaveBeenCalledWith("find_group_by_invite_code", { p_code: "abc123" });
    expect(g?.inviteCode).toBe("ABC123");
  });

  it("findByInviteCode returns undefined when RPC returns empty", async () => {
    const client = {
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as unknown as SupabaseClient;
    const repo = new SupabaseGroupRepository(client);
    expect(await repo.findByInviteCode("NONE")).toBeUndefined();
  });

  it("create uses create_group_with_admin RPC", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: groupRow, error: null });
    const client = { rpc } as unknown as SupabaseClient;
    const repo = new SupabaseGroupRepository(client);

    const g = await repo.create({
      name: "Trip",
      inviteCode: "abc123",
      createdBy: "u1",
    });
    expect(rpc).toHaveBeenCalledWith("create_group_with_admin", {
      p_name: "Trip",
      p_invite_code: "abc123",
    });
    expect(g.id).toBe("g1");
  });

  it("create maps unique violation to error via throwIfError", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "23505", message: "invite_code_key" },
    });
    const client = { rpc } as unknown as SupabaseClient;
    const repo = new SupabaseGroupRepository(client);
    await expect(
      repo.create({ name: "T", inviteCode: "DUP", createdBy: "u1" }),
    ).rejects.toThrow(DuplicateError);
  });

  it("addMember throws DuplicateError on unique violation", async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "23505", message: "unique" },
    });
    const client = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ single }),
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseGroupRepository(client);
    await expect(repo.addMember("g1", "u2", "member")).rejects.toThrow(DuplicateError);
  });

  it("getByUserId loads group ids then groups", async () => {
    const firstFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ group_id: "g1" }],
        error: null,
      }),
    };

    const secondFrom = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [groupRow],
        error: null,
      }),
    };

    let call = 0;
    const client = {
      from: jest.fn().mockImplementation(() => {
        call += 1;
        return call === 1 ? firstFrom : secondFrom;
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseGroupRepository(client);
    const groups = await repo.getByUserId("u1");
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Trip");
  });

  it("update returns existing when patch empty", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: groupRow, error: null });
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle,
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseGroupRepository(client);
    const g = await repo.update("g1", {});
    expect(g.id).toBe("g1");
  });

  it("delete removes group row by id", async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ delete: del });
    const client = { from } as unknown as SupabaseClient;

    const repo = new SupabaseGroupRepository(client);
    await repo.delete("g1");

    expect(from).toHaveBeenCalledWith("groups");
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "g1");
  });
});
