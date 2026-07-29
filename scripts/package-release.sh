#!/usr/bin/env bash
#
# 为 GitHub Release 生成可复现的源码归档和 SHA-256 校验文件。
#
# Raycast Store 直接接收源码 PR，不存在独立可安装二进制包。因此这里仅归档指定
# Git revision 中已提交的文件，避免把 node_modules、dist 或本地配置带入发布资产。

set -euo pipefail

tag="${1:-}"
revision="${2:-${tag}}"

if [[ ! "${tag}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
  echo "usage: $0 vMAJOR.MINOR.PATCH [git-revision]" >&2
  exit 2
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="${tag#v}"
archive_root="starcat-raycast-extension-${version}"
release_dir="${repo_root}/release"

cd "${repo_root}"

if ! git cat-file -e "${revision}^{commit}" 2>/dev/null; then
  echo "error: git revision '${revision}' does not exist" >&2
  exit 1
fi

if ! grep -Fq "## [${version}]" CHANGELOG.md; then
  echo "error: CHANGELOG.md has no ${version} release section" >&2
  exit 1
fi

mkdir -p "${release_dir}"
rm -f \
  "${release_dir}/${archive_root}.zip" \
  "${release_dir}/${archive_root}.tar.gz" \
  "${release_dir}/checksums.txt"

git archive \
  --format=zip \
  --prefix="${archive_root}/" \
  --output="${release_dir}/${archive_root}.zip" \
  "${revision}"

# gzip -n 去掉时间戳和原始文件名，使同一 revision 的 tar.gz 可重复生成。
git archive --format=tar --prefix="${archive_root}/" "${revision}" |
  gzip -n >"${release_dir}/${archive_root}.tar.gz"

(
  cd "${release_dir}"
  shasum -a 256 \
    "${archive_root}.zip" \
    "${archive_root}.tar.gz" >checksums.txt
)

echo "release assets created in ${release_dir}"
