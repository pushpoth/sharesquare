import { formatDate, relativeTime, isToday, toISODate, toISOTimestamp } from "./dateUtils";

describe("formatDate", () => {
  it("formats ISO date to short format", () => {
    const result = formatDate("2026-01-10T00:00:00Z");
    expect(result).toMatch(/Jan\s+10/);
  });
});

describe("relativeTime", () => {
  it('returns "just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(relativeTime(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("uses short human-readable phrases", () => {
    expect(relativeTime(new Date().toISOString())).toMatch(/just now/);
    const ago = new Date(Date.now() - 90 * 1000).toISOString();
    expect(relativeTime(ago)).toMatch(/ago$/);
  });
});

describe("isToday", () => {
  it("returns true for today", () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });
});

describe("toISODate", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = toISODate(new Date("2026-03-10T15:00:00Z"));
    expect(result).toBe("2026-03-10");
  });
});

describe("toISOTimestamp", () => {
  it("returns full ISO string", () => {
    const result = toISOTimestamp(new Date("2026-03-10T15:00:00.000Z"));
    expect(result).toBe("2026-03-10T15:00:00.000Z");
  });
});
