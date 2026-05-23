import { describe, expect, it } from "vitest";
import { abbreviateName, getInitials } from "./nameUtils";

describe("abbreviateName", () => {
  it("returns fallback for null input", () => {
    expect(abbreviateName(null)).toBe("Không xác định");
  });

  it("returns fallback for empty string", () => {
    expect(abbreviateName("")).toBe("Không xác định");
  });

  it("returns fallback for whitespace-only string", () => {
    expect(abbreviateName("   ")).toBe("Không xác định");
  });

  it("returns as-is for a 1-word name", () => {
    expect(abbreviateName("Kiệt")).toBe("Kiệt");
  });

  it("returns as-is for a 2-word name", () => {
    expect(abbreviateName("Bảo Vy")).toBe("Bảo Vy");
  });

  it("abbreviates a 3-word name", () => {
    expect(abbreviateName("Nguyễn Quang Khánh")).toBe("Q. Khánh");
  });

  it("abbreviates a 4-word name", () => {
    expect(abbreviateName("Nguyễn Quang Khánh Tâm")).toBe("K. Tâm");
  });
});

describe("getInitials", () => {
  it("returns initials from last 2 words of a 3-word Vietnamese name", () => {
    expect(getInitials("Phan Gia Bảo")).toBe("GB");
  });

  it("returns initials from last 2 words of a 4-word name", () => {
    expect(getInitials("Nguyễn Quang Khánh Tâm")).toBe("KT");
  });

  it("returns both initials for a 2-word name", () => {
    expect(getInitials("Bảo Vy")).toBe("BV");
  });

  it("returns single initial for a 1-word name", () => {
    expect(getInitials("Kiệt")).toBe("K");
  });

  it("uppercases diacritical Vietnamese characters", () => {
    expect(getInitials("Lê Thị Ân")).toBe("TÂ");
  });
});
