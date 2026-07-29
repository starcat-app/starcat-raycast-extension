/**
 * CLI 稳定错误码到 Raycast 展示文案的唯一映射。
 *
 * stderr 只用于提取稳定错误码，绝不直接展示，避免将 token、路径或服务细节带入 UI。
 */
export const PUBLIC_ERROR_CODES = [
  "CLI_NOT_FOUND",
  "CLI_NOT_PAIRED",
  "REQUIRES_PRO",
  "MCP_DISABLED",
  "UPGRADE_REQUIRED",
  "SEARCH_TIMEOUT",
  "SEARCH_FAILED",
] as const;

export type PublicErrorCode = (typeof PUBLIC_ERROR_CODES)[number];

const publicErrorCodeSet = new Set<string>(PUBLIC_ERROR_CODES);

export class LauncherError extends Error {
  constructor(
    public readonly code: PublicErrorCode | "ABORTED",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "LauncherError";
  }
}

export function parseStableErrorCode(stderr: string): PublicErrorCode | null {
  const match = stderr.match(/STARCAT_ERROR\s+([A-Z_]+)\s*:/);
  if (!match || !publicErrorCodeSet.has(match[1])) {
    return null;
  }
  return match[1] as PublicErrorCode;
}

export interface ErrorPresentation {
  title: string;
  description: string;
}

export function userFacingError(error: unknown): ErrorPresentation {
  const code = error instanceof LauncherError && publicErrorCodeSet.has(error.code) ? error.code : "SEARCH_FAILED";

  switch (code) {
    case "CLI_NOT_FOUND":
      return {
        title: "Starcat CLI Not Found",
        description: "Install the CLI with Homebrew or configure an absolute CLI path in preferences.",
      };
    case "CLI_NOT_PAIRED":
      return {
        title: "Starcat CLI Is Not Paired",
        description: "Copy and run the pairing command from Starcat MCP settings.",
      };
    case "REQUIRES_PRO":
      return {
        title: "Starcat Pro Is Required",
        description: "External launcher integrations are available with Starcat Pro.",
      };
    case "MCP_DISABLED":
      return {
        title: "Starcat MCP Service Is Disabled",
        description: "Enable MCP Service in Starcat settings and try again.",
      };
    case "UPGRADE_REQUIRED":
      return {
        title: "Upgrade Starcat and the CLI",
        description: "Global repository search requires Starcat CLI 1.1.0 or newer.",
      };
    case "SEARCH_TIMEOUT":
      return {
        title: "Search Timed Out",
        description: "Check Starcat MCP Service and your network connection.",
      };
    default:
      return {
        title: "Search Failed",
        description: "Run starcat doctor to inspect the connection.",
      };
  }
}
