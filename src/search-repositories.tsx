/**
 * Raycast 命令入口：通过 Starcat CLI 搜索本地仓库与 GitHub。
 *
 * Raycast 只负责输入、展示与打开结果；权限、配对、Pro entitlement、数据合并和
 * GitHub 搜索都继续由 Starcat CLI/MCP 负责，避免外部集成复制业务逻辑。
 */
import {
  Action,
  ActionPanel,
  Icon,
  Image,
  List,
  getPreferenceValues,
  openExtensionPreferences,
  Keyboard,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useMemo, useRef, useState } from "react";

import { searchRepositories } from "./lib/cli";
import { DEFAULT_LIMIT, DEFAULT_SOURCE, FALLBACK_ICON, type SearchSource } from "./lib/constants";
import { userFacingError } from "./lib/errors";
import { repositoryPresentation } from "./lib/presentation";

interface Preferences {
  starcatCliPath?: string;
}

export default function SearchRepositoriesCommand() {
  const preferences = getPreferenceValues<Preferences>();
  const [searchText, setSearchText] = useState("");
  const [source, setSource] = useState<SearchSource>(DEFAULT_SOURCE);
  const abortable = useRef<AbortController | null>(null);
  const query = searchText.trim();
  const cliPath = preferences.starcatCliPath?.trim() || undefined;

  const { data, error, isLoading, revalidate } = usePromise(
    async (currentQuery: string, currentSource: SearchSource, currentCLIPath?: string) =>
      searchRepositories({
        query: currentQuery,
        source: currentSource,
        limit: DEFAULT_LIMIT,
        cliPath: currentCLIPath,
        signal: abortable.current?.signal,
      }),
    [query, source, cliPath],
    {
      abortable,
      execute: query.length > 0,
      // 使用命令内的稳定错误映射，避免 utils 默认 toast 暴露底层错误文本。
      onError: () => undefined,
    },
  );

  const { repositories, hiddenResultCount } = useMemo(() => {
    const mapped = data?.items.map(repositoryPresentation) ?? [];
    const visible = mapped.filter((item) => item !== null);

    return {
      repositories: visible,
      hiddenResultCount: mapped.length - visible.length,
    };
  }, [data]);
  const warnings = [
    ...(data?.warnings ?? []),
    ...(hiddenResultCount > 0
      ? [
          `${hiddenResultCount} result${hiddenResultCount === 1 ? "" : "s"} hidden because the target URL is not trusted.`,
        ]
      : []),
  ];

  const errorPresentation = error ? userFacingError(error) : null;
  const emptyTitle = errorPresentation?.title ?? (query ? "No Repositories Found" : "Search Starcat Repositories");
  const emptyDescription =
    errorPresentation?.description ??
    (query
      ? "Try another keyword or choose a different source."
      : "Type a keyword to search Starcat local repositories and GitHub.");

  return (
    <List
      filtering={false}
      throttle
      isLoading={query.length > 0 && isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search repositories by name, owner, language, or description…"
      searchBarAccessory={
        <List.Dropdown tooltip="Search Source" value={source} onChange={(value) => setSource(value as SearchSource)}>
          <List.Dropdown.Item title="All Sources" value="all" icon={Icon.MagnifyingGlass} />
          <List.Dropdown.Item title="Starcat Local" value="local" icon={Icon.HardDrive} />
          <List.Dropdown.Item title="GitHub" value="github" icon={Icon.Globe} />
        </List.Dropdown>
      }
    >
      {repositories.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={FALLBACK_ICON}
          title={emptyTitle}
          description={emptyDescription}
          actions={
            <ActionPanel>
              {query ? <Action title="Retry Search" icon={Icon.ArrowClockwise} onAction={revalidate} /> : null}
              <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
              {errorPresentation ? (
                <Action.CopyToClipboard title="Copy Diagnostic Command" content="starcat doctor" icon={Icon.Terminal} />
              ) : null}
            </ActionPanel>
          }
        />
      ) : (
        <>
          <List.Section title={data ? `${repositories.length} Repositories` : "Repositories"}>
            {repositories.map((repository) => (
              <List.Item
                key={`${repository.source}:${repository.title}`}
                title={repository.title}
                subtitle={repository.subtitle}
                icon={{
                  source: repository.iconURL ?? FALLBACK_ICON,
                  fallback: FALLBACK_ICON,
                  mask: Image.Mask.Circle,
                }}
                accessories={[
                  {
                    tag: repository.sourceLabel,
                    icon: repository.source === "local" ? Icon.HardDrive : Icon.Globe,
                  },
                  ...(repository.language ? [{ text: repository.language }] : []),
                  { text: repository.stars, icon: Icon.Star },
                ]}
                actions={
                  <ActionPanel>
                    <Action.Open
                      title={repository.source === "local" ? "Open in Starcat" : "Open in GitHub"}
                      target={repository.openURL}
                      icon={repository.source === "local" ? Icon.HardDrive : Icon.Globe}
                    />
                    {repository.githubURL ? (
                      <Action.OpenInBrowser
                        title="Open Repository on GitHub"
                        url={repository.githubURL}
                        icon={Icon.Globe}
                        shortcut={{ modifiers: ["cmd"], key: "g" }}
                      />
                    ) : null}
                    {repository.githubURL ? (
                      <Action.CopyToClipboard
                        title="Copy GitHub URL"
                        content={repository.githubURL}
                        shortcut={Keyboard.Shortcut.Common.Copy}
                      />
                    ) : null}
                    <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
          {warnings.length ? (
            <List.Section title="Warnings">
              {warnings.map((warning, index) => (
                <List.Item
                  key={`${index}:${warning}`}
                  title="A Search Source Is Temporarily Unavailable"
                  subtitle={warning}
                  icon={Icon.Warning}
                />
              ))}
            </List.Section>
          ) : null}
        </>
      )}
    </List>
  );
}
