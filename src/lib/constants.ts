/**
 * Raycast 适配器与测试共享的边界常量。
 *
 * 这些值与 CLI 全局搜索 v1 契约保持一致，避免 UI 与进程层各自维护一套限制。
 */
export const DEFAULT_LIMIT = 30;
export const DEFAULT_SOURCE = "all" as const;
export const DEFAULT_TIMEOUT_MS = 8_000;
export const MINIMUM_CLI_VERSION = [1, 1, 0] as const;
export const MAX_STDOUT_BYTES = 2 * 1024 * 1024;
export const MAX_STDERR_BYTES = 64 * 1024;
export const FALLBACK_ICON = "repo-fallback.png";

export const SEARCH_SOURCES = ["all", "local", "github"] as const;

export type SearchSource = (typeof SEARCH_SOURCES)[number];
