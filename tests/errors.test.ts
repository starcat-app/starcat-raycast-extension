/**
 * 稳定错误码解析与安全展示测试。
 */
import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";

import { LauncherError, PUBLIC_ERROR_CODES, parseStableErrorCode, userFacingError } from "../src/lib/errors";

describe("errors", () => {
  it("extracts only public stable codes", () => {
    expect(parseStableErrorCode("STARCAT_ERROR CLI_NOT_PAIRED: missing profile")).toBe("CLI_NOT_PAIRED");
    expect(parseStableErrorCode("STARCAT_ERROR INTERNAL_SECRET: token=abc")).toBeNull();
  });

  it("does not expose raw error details", () => {
    const presentation = userFacingError(
      new LauncherError("SEARCH_FAILED", "token=secret /Users/private/path"),
    );

    expect(presentation.title).toBe("Search Failed");
    expect(presentation.description).not.toContain("secret");
    expect(presentation.description).not.toContain("/Users");
  });

  it("matches the versioned public error-code fixture", () => {
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "error-codes.json"), "utf8"));

    expect(fixture.errors.map((entry: { code: string }) => entry.code)).toEqual(PUBLIC_ERROR_CODES);
  });
});
