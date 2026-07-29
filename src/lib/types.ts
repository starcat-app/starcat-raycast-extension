/**
 * Starcat CLI `search` 命令 schema v1 的最小消费模型。
 *
 * 上游契约允许增加 optional 字段，因此这里只声明 Raycast 实际使用的字段。
 */
export interface Repository {
  repo_id: number | null;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars_count: number;
  is_private: boolean;
  is_starred: boolean;
  primary_source: "local" | "github";
  sources: Array<"local" | "github">;
  icon_url: string;
  open_url: string;
  html_url: string;
  updated_at: string | null;
}

export interface ProviderResult {
  status: "success" | "failed";
  count: number;
  message: string | null;
}

export interface SearchResult {
  schema_version: 1;
  query: string;
  returned_count: number;
  items: Repository[];
  providers: {
    local: ProviderResult | null;
    github: ProviderResult | null;
  };
  warnings: string[];
}
