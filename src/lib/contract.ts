/**
 * Starcat 全局搜索 schema v1 的运行时最小校验。
 *
 * JSON 来自外部进程，TypeScript 类型不会提供运行时保护。这里仅校验 Raycast
 * 实际消费的必需字段，并明确忽略新增字段，以保持 v1 的向前兼容。
 */
import { LauncherError } from "./errors";
import type { Repository, SearchResult } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function invalidContract(message: string): LauncherError {
  return new LauncherError("UPGRADE_REQUIRED", message);
}

function requireString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw invalidContract(`${field} must be a non-empty string`);
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isOmittedOrNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || isNullableString(value);
}

function validateRepository(value: unknown, index: number): Repository {
  if (!isObject(value)) {
    throw invalidContract(`items[${index}] must be an object`);
  }

  for (const field of ["owner", "name", "full_name", "icon_url", "open_url", "html_url"]) {
    requireString(value[field], `items[${index}].${field}`);
  }
  if (value.primary_source !== "local" && value.primary_source !== "github") {
    throw invalidContract(`items[${index}].primary_source is unsupported`);
  }
  if (!Number.isInteger(value.stars_count) || Number(value.stars_count) < 0) {
    throw invalidContract(`items[${index}].stars_count must be non-negative`);
  }
  if (!Array.isArray(value.sources) || value.sources.length === 0) {
    throw invalidContract(`items[${index}].sources must not be empty`);
  }
  if (value.sources.some((source) => source !== "local" && source !== "github")) {
    throw invalidContract(`items[${index}].sources contains an unsupported source`);
  }
  if (typeof value.is_private !== "boolean" || typeof value.is_starred !== "boolean") {
    throw invalidContract(`items[${index}] boolean fields are invalid`);
  }
  if (!(value.repo_id === null || Number.isInteger(value.repo_id))) {
    throw invalidContract(`items[${index}].repo_id is invalid`);
  }
  if (
    !isOmittedOrNullableString(value.description) ||
    !isOmittedOrNullableString(value.language) ||
    !isOmittedOrNullableString(value.updated_at)
  ) {
    throw invalidContract(`items[${index}] nullable string fields are invalid`);
  }

  // CLI 的 Go JSON encoder 会省略 nil pointer 字段，而版本化 fixture 使用显式
  // null。适配器在边界统一成 null，避免 UI 层承担两种等价表示。
  return {
    ...value,
    description: value.description ?? null,
    language: value.language ?? null,
    updated_at: value.updated_at ?? null,
  } as unknown as Repository;
}

function normalizeProvider(value: unknown, field: string) {
  if (value === null) {
    return null;
  }
  if (!isObject(value)) {
    throw invalidContract(`${field} must be an object or null`);
  }
  if (
    (value.status !== "success" && value.status !== "failed") ||
    !Number.isInteger(value.count) ||
    Number(value.count) < 0
  ) {
    throw invalidContract(`${field} status or count is invalid`);
  }
  if (!isOmittedOrNullableString(value.message)) {
    throw invalidContract(`${field}.message is invalid`);
  }
  return {
    ...value,
    message: value.message ?? null,
  };
}

export function decodeSearchResult(stdout: string): SearchResult {
  let value: unknown;
  try {
    value = JSON.parse(stdout);
  } catch (error) {
    throw new LauncherError("UPGRADE_REQUIRED", "Starcat CLI returned invalid global-search JSON", {
      cause: error,
    });
  }

  if (!isObject(value) || value.schema_version !== 1) {
    throw new LauncherError("UPGRADE_REQUIRED", "Unsupported Starcat global-search schema version");
  }
  requireString(value.query, "query");
  if (!Array.isArray(value.items) || !Array.isArray(value.warnings)) {
    throw invalidContract("items and warnings must be arrays");
  }
  if (!Number.isInteger(value.returned_count) || value.returned_count !== value.items.length) {
    throw invalidContract("returned_count must equal items.length");
  }
  if (!isObject(value.providers)) {
    throw invalidContract("providers must be an object");
  }

  const items = value.items.map(validateRepository);
  if (value.warnings.some((warning) => typeof warning !== "string")) {
    throw invalidContract("warnings must contain strings");
  }
  const local = normalizeProvider(value.providers.local, "providers.local");
  const github = normalizeProvider(value.providers.github, "providers.github");

  return {
    ...value,
    items,
    providers: {
      ...value.providers,
      local,
      github,
    },
  } as unknown as SearchResult;
}
