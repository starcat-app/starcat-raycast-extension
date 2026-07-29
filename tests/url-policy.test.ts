/**
 * 外部打开与头像 URL allowlist 测试。
 */
import { describe, expect, it } from "vitest";

import { safeAvatarURL, safeOpenURL } from "../src/lib/url-policy";

describe("safeOpenURL", () => {
  it.each([
    "starcat://repo/starcat-app/starcat?v=1&rid=123",
    "starcat://repo/starcat-app/starcat?v=1",
    "https://github.com/starcat-app/starcat",
  ])("allows repository URL %s", (url) => {
    expect(safeOpenURL(url)).toBe(url);
  });

  it.each([
    "javascript:alert(1)",
    "https://evil.example/starcat-app/starcat",
    "https://user:pass@github.com/starcat-app/starcat",
    "https://github.com:443/starcat-app/starcat",
    "https://github.com/starcat-app/starcat/issues",
    "https://github.com/starcat-app/starcat?tab=readme",
    "starcat://repo/starcat-app/starcat?v=2",
    "starcat://repo/starcat-app/starcat?v=1&rid=0",
    "starcat://repo/starcat-app/starcat?v=1&unexpected=1",
  ])("rejects unsafe URL %s", (url) => {
    expect(safeOpenURL(url)).toBeNull();
  });
});

describe("safeAvatarURL", () => {
  it.each([
    "https://github.com/starcat-app.png?size=80",
    "https://avatars.githubusercontent.com/u/1?v=4",
  ])("allows trusted avatar URL %s", (url) => {
    expect(safeAvatarURL(url)).toBe(url);
  });

  it.each([
    "http://github.com/starcat-app.png",
    "https://evil.example/avatar.png",
    "https://github.com/starcat-app",
    "https://github.com:443/starcat-app.png",
  ])("rejects untrusted avatar URL %s", (url) => {
    expect(safeAvatarURL(url)).toBeNull();
  });
});
