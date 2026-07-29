/**
 * CLI 契约到 Raycast 列表展示模型的纯映射。
 */
import type { Repository } from "./types";
import { safeAvatarURL, safeOpenURL } from "./url-policy";

export interface RepositoryPresentation {
  title: string;
  subtitle?: string;
  sourceLabel: "Starcat Local" | "GitHub";
  source: Repository["primary_source"];
  language?: string;
  stars: string;
  iconURL: string | null;
  openURL: string;
  githubURL: string | null;
}

export function formatStars(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return trimDecimal(value / 1_000_000) + "M";
  }
  if (Math.abs(value) >= 1_000) {
    return trimDecimal(value / 1_000) + "k";
  }
  return String(value);
}

function trimDecimal(value: number): string {
  const digits = Math.abs(value) >= 100 ? 0 : 1;
  return value.toFixed(digits).replace(/\.0$/, "");
}

export function collapseText(value: string | null, maxLength: number): string | undefined {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return undefined;
  }
  return normalized.length <= maxLength ? normalized : normalized.slice(0, Math.max(0, maxLength - 1)) + "…";
}

export function repositoryPresentation(repository: Repository): RepositoryPresentation | null {
  const openURL = safeOpenURL(repository.open_url);
  if (!openURL) {
    return null;
  }
  return {
    title: repository.full_name,
    subtitle: collapseText(repository.description, 140),
    sourceLabel: repository.primary_source === "local" ? "Starcat Local" : "GitHub",
    source: repository.primary_source,
    language: collapseText(repository.language, 40),
    stars: formatStars(repository.stars_count),
    iconURL: safeAvatarURL(repository.icon_url),
    openURL,
    githubURL: safeOpenURL(repository.html_url),
  };
}
