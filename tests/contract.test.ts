/**
 * CLI v1 fixtures 与运行时 decoder 的契约测试。
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { decodeSearchResult } from "../src/lib/contract";
import { LauncherError } from "../src/lib/errors";

function fixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

describe("decodeSearchResult", () => {
  it("decodes the shared success fixture", () => {
    const result = decodeSearchResult(fixture("success-all.json"));

    expect(result.returned_count).toBe(2);
    expect(result.items.map((item) => item.primary_source)).toEqual(["local", "github"]);
  });

  it("preserves partial-provider warnings", () => {
    const result = decodeSearchResult(fixture("success-local-warning.json"));

    expect(result.items).toHaveLength(1);
    expect(result.providers.github?.status).toBe("failed");
    expect(result.warnings).toHaveLength(1);
  });

  it("decodes an empty result", () => {
    const result = decodeSearchResult(fixture("empty.json"));

    expect(result.returned_count).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("accepts additive v1 fields", () => {
    const value = JSON.parse(fixture("success-all.json"));
    value.future_field = { enabled: true };
    value.items[0].future_item_field = "accepted";

    expect(decodeSearchResult(JSON.stringify(value)).returned_count).toBe(2);
  });

  it("normalizes nullable fields omitted by the Go JSON encoder", () => {
    const value = JSON.parse(fixture("success-all.json"));
    delete value.items[0].language;
    delete value.items[0].updated_at;
    delete value.providers.local.message;

    const result = decodeSearchResult(JSON.stringify(value));

    expect(result.items[0].language).toBeNull();
    expect(result.items[0].updated_at).toBeNull();
    expect(result.providers.local?.message).toBeNull();
  });

  it("rejects unsupported schema versions", () => {
    const value = JSON.parse(fixture("success-all.json"));
    value.schema_version = 2;

    expect(() => decodeSearchResult(JSON.stringify(value))).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "UPGRADE_REQUIRED" }),
    );
  });

  it("rejects mismatched returned_count", () => {
    const value = JSON.parse(fixture("success-all.json"));
    value.returned_count = 99;

    expect(() => decodeSearchResult(JSON.stringify(value))).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "UPGRADE_REQUIRED" }),
    );
  });

  it("rejects negative provider counts", () => {
    const value = JSON.parse(fixture("success-all.json"));
    value.providers.local.count = -1;

    expect(() => decodeSearchResult(JSON.stringify(value))).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "UPGRADE_REQUIRED" }),
    );
  });
});
