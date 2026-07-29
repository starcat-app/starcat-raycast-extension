/**
 * 搜索结果展示映射测试，重点验证来源标签与打开目标。
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { decodeSearchResult } from "../src/lib/contract";
import { collapseText, formatStars, repositoryPresentation } from "../src/lib/presentation";

const fixture = decodeSearchResult(
  fs.readFileSync(path.join(__dirname, "fixtures", "success-all.json"), "utf8"),
);

describe("repositoryPresentation", () => {
  it("keeps local source first and opens local results in Starcat", () => {
    const item = repositoryPresentation(fixture.items[0]);

    expect(item).toMatchObject({
      sourceLabel: "Starcat Local",
      openURL: "starcat://repo/starcat-app/starcat?v=1&rid=123",
      stars: "1.2k",
    });
  });

  it("opens remote-only results on GitHub", () => {
    const item = repositoryPresentation(fixture.items[1]);

    expect(item).toMatchObject({
      sourceLabel: "GitHub",
      openURL: "https://github.com/example/remote-repo",
    });
  });

  it("formats star counts and collapses descriptions", () => {
    expect(formatStars(999)).toBe("999");
    expect(formatStars(1_200)).toBe("1.2k");
    expect(formatStars(1_500_000)).toBe("1.5M");
    expect(collapseText("  one \n two  ", 20)).toBe("one two");
    expect(collapseText("123456", 5)).toBe("1234…");
  });
});
