/**
 * 可选的真实 Starcat CLI smoke test。
 *
 * CI 默认跳过；本地设置 `STARCAT_LIVE_CLI` 后会走真实配对与 MCP 服务，验证适配器
 * 能消费当前 CLI 输出。测试只读取搜索结果，不写入 Starcat 数据。
 */
import { expect, it } from "vitest";

import { searchRepositories } from "../src/lib/cli";

const liveCLI = process.env.STARCAT_LIVE_CLI;

it.skipIf(!liveCLI)("searches through a real paired Starcat CLI", async () => {
  const result = await searchRepositories({
    query: "starcat",
    source: "all",
    limit: 5,
    cliPath: liveCLI,
  });

  expect(result.schema_version).toBe(1);
  expect(result.returned_count).toBe(result.items.length);
  expect(result.items.length).toBeGreaterThan(0);
});
