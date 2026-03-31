import { generateId } from "./idGenerator";

describe("generateId", () => {
  it("generates a string ID", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBe(36); // UUID format
  });

  it("generates valid UUID format", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});
