/**
 * Starcat CLI 定位与进程调用。
 *
 * 查询词始终作为独立 argv 传给 `execFile`，禁止 shell 字符串拼接。调用方传入的
 * AbortSignal 与内部 timeout 共用一个控制器，确保 Raycast 快速输入时旧搜索进程
 * 会被终止，不会把过期结果重新绘制到列表。
 */
import { execFile as nodeExecFile, type ChildProcess, type ExecFileException } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  DEFAULT_LIMIT,
  DEFAULT_SOURCE,
  DEFAULT_TIMEOUT_MS,
  MAX_STDERR_BYTES,
  MAX_STDOUT_BYTES,
  MINIMUM_CLI_VERSION,
  SEARCH_SOURCES,
  type SearchSource,
} from "./constants";
import { decodeSearchResult } from "./contract";
import { LauncherError, parseStableErrorCode } from "./errors";
import type { SearchResult } from "./types";

export type ExecFileRunner = (
  executable: string,
  args: readonly string[],
  options: {
    encoding: BufferEncoding;
    maxBuffer: number;
    shell: false;
    signal: AbortSignal;
    windowsHide: boolean;
  },
  callback: (error: ExecFileException | null, stdout: string, stderr: string) => void,
) => ChildProcess;

export interface ExecuteCLIOptions {
  execFile?: ExecFileRunner;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface SearchRepositoriesOptions extends ExecuteCLIOptions {
  query: string;
  source?: SearchSource;
  limit?: number;
  cliPath?: string;
  environment?: NodeJS.ProcessEnv;
}

export function executableFile(candidate: string): boolean {
  try {
    const stats = fs.statSync(candidate);
    fs.accessSync(candidate, fs.constants.X_OK);
    return stats.isFile();
  } catch {
    return false;
  }
}

export function resolveCLI(explicitPath?: string, environment: NodeJS.ProcessEnv = process.env): string {
  const candidates: string[] = [];
  const configured = String(explicitPath || environment.STARCAT_CLI_PATH || "").trim();
  if (configured) {
    if (!path.isAbsolute(configured)) {
      throw new LauncherError("CLI_NOT_FOUND", "Starcat CLI preference must be an absolute path");
    }
    candidates.push(configured);
  }

  for (const directory of String(environment.PATH || "").split(path.delimiter)) {
    if (directory) {
      candidates.push(path.join(directory, "starcat"));
    }
  }
  candidates.push(
    "/opt/homebrew/bin/starcat",
    "/usr/local/bin/starcat",
    path.join(os.homedir(), ".local", "bin", "starcat"),
  );

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = path.resolve(candidate);
    if (!seen.has(normalized) && executableFile(normalized)) {
      return normalized;
    }
    seen.add(normalized);
  }
  throw new LauncherError("CLI_NOT_FOUND", "Starcat CLI was not found");
}

export function buildSearchArgs(query: string, source: SearchSource, limit: number): string[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0 || normalizedQuery.length > 200) {
    throw new LauncherError("SEARCH_FAILED", "query must contain between 1 and 200 characters");
  }
  if (!SEARCH_SOURCES.includes(source)) {
    throw new LauncherError("SEARCH_FAILED", "unsupported search source");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new LauncherError("SEARCH_FAILED", "limit must be between 1 and 50");
  }
  return ["search", normalizedQuery, "--source", source, "--limit", String(limit)];
}

export function parseCLIVersion(output: string): number[] | null {
  const match = output.trim().match(/^Starcat CLI v?([0-9]+)\.([0-9]+)\.([0-9]+)$/);
  return match ? match.slice(1).map(Number) : null;
}

export function versionIsOlder(version: readonly number[], minimum: readonly number[]): boolean {
  for (let index = 0; index < minimum.length; index += 1) {
    if (version[index] !== minimum[index]) {
      return version[index] < minimum[index];
    }
  }
  return false;
}

export function executeCLI(
  executable: string,
  args: readonly string[],
  options: ExecuteCLIOptions = {},
): Promise<string> {
  const execFile = options.execFile ?? (nodeExecFile as unknown as ExecFileRunner);
  const callerSignal = options.signal;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  let timedOut = false;
  let stderrOverflow = false;

  return new Promise((resolve, reject) => {
    const relayAbort = () => controller.abort();
    if (callerSignal?.aborted) {
      reject(new LauncherError("ABORTED", "Search was cancelled"));
      return;
    }
    callerSignal?.addEventListener("abort", relayAbort, { once: true });

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const finish = (handler: () => void) => {
      clearTimeout(timeout);
      callerSignal?.removeEventListener("abort", relayAbort);
      handler();
    };

    let child: ChildProcess;
    try {
      child = execFile(
        executable,
        args,
        {
          encoding: "utf8",
          maxBuffer: MAX_STDOUT_BYTES,
          shell: false,
          signal: controller.signal,
          windowsHide: true,
        },
        (error, stdout, stderr) => {
          finish(() => {
            if (timedOut) {
              reject(new LauncherError("SEARCH_TIMEOUT", "Starcat search timed out"));
              return;
            }
            if (callerSignal?.aborted) {
              reject(new LauncherError("ABORTED", "Search was cancelled"));
              return;
            }
            if (stderrOverflow) {
              reject(new LauncherError("SEARCH_FAILED", "Starcat CLI stderr exceeded the limit"));
              return;
            }
            if (error) {
              if (error.code === "ENOENT") {
                reject(new LauncherError("CLI_NOT_FOUND", "Starcat CLI was not found", { cause: error }));
                return;
              }
              const code = parseStableErrorCode(stderr) ?? "SEARCH_FAILED";
              reject(
                new LauncherError(code, "Starcat search failed", {
                  cause: error,
                }),
              );
              return;
            }
            resolve(stdout);
          });
        },
      );
    } catch (error) {
      finish(() => {
        const code =
          typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"
            ? "CLI_NOT_FOUND"
            : "SEARCH_FAILED";
        reject(
          new LauncherError(code, "Unable to start Starcat CLI", {
            cause: error,
          }),
        );
      });
      return;
    }

    // `execFile` 只有一个 maxBuffer。stdout 使用 2 MiB 上限，stderr 另外在流层面
    // 限制为 64 KiB，避免失败进程把无界日志保留在 Raycast extension host 内存中。
    let stderrBytes = 0;
    child.stderr?.on("data", (chunk: Buffer | string) => {
      stderrBytes += Buffer.byteLength(chunk);
      if (stderrBytes > MAX_STDERR_BYTES && !stderrOverflow) {
        stderrOverflow = true;
        controller.abort();
      }
    });
  });
}

export async function searchRepositories(options: SearchRepositoriesOptions): Promise<SearchResult> {
  const source = options.source ?? DEFAULT_SOURCE;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const args = buildSearchArgs(options.query, source, limit);
  const executable = resolveCLI(options.cliPath, options.environment);
  const executeOptions: ExecuteCLIOptions = {
    execFile: options.execFile,
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  };

  let stdout: string;
  try {
    stdout = await executeCLI(executable, args, executeOptions);
  } catch (searchError) {
    if (!(searchError instanceof LauncherError) || searchError.code !== "SEARCH_FAILED") {
      throw searchError;
    }

    // v1.0.0 尚未实现 search，也无法输出稳定错误码。只在未分类失败路径额外
    // 查询一次版本，避免正常输入热路径为每次按键多启动一个进程。
    try {
      const versionOutput = await executeCLI(executable, ["version"], executeOptions);
      const version = parseCLIVersion(versionOutput);
      if (version && versionIsOlder(version, MINIMUM_CLI_VERSION)) {
        throw new LauncherError("UPGRADE_REQUIRED", "Starcat CLI 1.1.0 or newer is required");
      }
    } catch (diagnosticError) {
      if (diagnosticError instanceof LauncherError && diagnosticError.code === "UPGRADE_REQUIRED") {
        throw diagnosticError;
      }
      // 诊断失败不能覆盖原始搜索错误，否则会把网络或服务问题误报成版本问题。
    }
    throw searchError;
  }

  if (Buffer.byteLength(stdout, "utf8") > MAX_STDOUT_BYTES) {
    throw new LauncherError("SEARCH_FAILED", "Starcat CLI stdout exceeded the limit");
  }
  return decodeSearchResult(stdout);
}
