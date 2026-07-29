/**
 * 仓库与头像 URL allowlist。
 *
 * CLI 返回的数据仍属于外部输入。Raycast 仅打开严格的 GitHub 仓库 URL 或 Starcat
 * v1 deep link，防止恶意 scheme、凭据、端口与额外路径被当作 Action 目标。
 */
const REPOSITORY_SEGMENT = /^[A-Za-z0-9_.-]+$/;

function hasExplicitPort(rawValue: string): boolean {
  const match = rawValue.match(/^[A-Za-z][A-Za-z0-9+.-]*:\/\/([^/?#]*)/);
  if (!match) {
    return false;
  }
  const authority = match[1].slice(match[1].lastIndexOf("@") + 1);
  return /:[0-9]+$/.test(authority);
}

function hasRepositoryPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts.every((part) => REPOSITORY_SEGMENT.test(part));
}

export function safeOpenURL(rawValue: string): string | null {
  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    return null;
  }
  if (
    url.username ||
    url.password ||
    url.port ||
    hasExplicitPort(rawValue) ||
    url.hash ||
    !hasRepositoryPath(url.pathname)
  ) {
    return null;
  }
  if (url.protocol === "https:") {
    return url.hostname.toLowerCase() === "github.com" && !url.search ? rawValue : null;
  }
  if (url.protocol !== "starcat:" || url.hostname !== "repo") {
    return null;
  }

  const keys = Array.from(url.searchParams.keys());
  if (
    url.searchParams.getAll("v").length !== 1 ||
    url.searchParams.get("v") !== "1" ||
    keys.some((key) => key !== "v" && key !== "rid")
  ) {
    return null;
  }
  if (url.searchParams.has("rid")) {
    const values = url.searchParams.getAll("rid");
    if (values.length !== 1 || !/^[1-9][0-9]*$/.test(values[0])) {
      return null;
    }
  }
  return rawValue;
}

export function safeAvatarURL(rawValue: string): string | null {
  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port || hasExplicitPort(rawValue) || url.hash) {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === "avatars.githubusercontent.com") {
    return rawValue;
  }
  return host === "github.com" && url.pathname.toLowerCase().endsWith(".png") ? rawValue : null;
}
