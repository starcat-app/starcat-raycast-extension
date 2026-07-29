/**
 * CLI argv、定位、timeout、取消与稳定错误码测试。
 */
import { describe, expect, it } from "vitest";

import {
  buildSearchArgs,
  executeCLI,
  parseCLIVersion,
  resolveCLI,
  versionIsOlder,
} from "../src/lib/cli";
import { LauncherError } from "../src/lib/errors";

describe("CLI adapter", () => {
  it("builds search arguments without a shell", () => {
    expect(buildSearchArgs(" swift cli ", "all", 30)).toEqual([
      "search",
      "swift cli",
      "--source",
      "all",
      "--limit",
      "30",
    ]);
  });

  it("rejects invalid search arguments", () => {
    expect(() => buildSearchArgs("", "all", 30)).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "SEARCH_FAILED" }),
    );
    expect(() => buildSearchArgs("repo", "all", 51)).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "SEARCH_FAILED" }),
    );
  });

  it("resolves an explicit executable and rejects relative preferences", () => {
    expect(resolveCLI(process.execPath, { PATH: "" })).toBe(process.execPath);
    expect(() => resolveCLI("bin/starcat", { PATH: "" })).toThrowError(
      expect.objectContaining<Partial<LauncherError>>({ code: "CLI_NOT_FOUND" }),
    );
  });

  it("executes argv and captures stdout", async () => {
    await expect(executeCLI(process.execPath, ["-e", "process.stdout.write('ok')"])).resolves.toBe("ok");
  });

  it("maps CLI stable error codes", async () => {
    await expect(
      executeCLI(process.execPath, [
        "-e",
        "process.stderr.write('STARCAT_ERROR MCP_DISABLED: disabled'); process.exit(1)",
      ]),
    ).rejects.toMatchObject({ code: "MCP_DISABLED" });
  });

  it("times out a stalled process", async () => {
    await expect(
      executeCLI(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { timeoutMs: 20 }),
    ).rejects.toMatchObject({ code: "SEARCH_TIMEOUT" });
  });

  it("cancels a stale process", async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);

    await expect(
      executeCLI(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: "ABORTED" });
  });

  it("parses and compares CLI versions", () => {
    expect(parseCLIVersion("Starcat CLI 1.1.0\n")).toEqual([1, 1, 0]);
    expect(parseCLIVersion("unexpected")).toBeNull();
    expect(versionIsOlder([1, 0, 0], [1, 1, 0])).toBe(true);
    expect(versionIsOlder([1, 2, 0], [1, 1, 0])).toBe(false);
  });
});
