# Releasing

## Version policy

Raycast extensions do not declare a `version` property in `package.json`. The
Store exposes one implicit latest version and automatically updates users after
an accepted submission. Use Git tags and this changelog for repository-level
milestones only; they do not control Raycast Store updates.

## Release gates

Use Node.js 22.22.2 or newer, then run:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

Complete the Raycast manual acceptance checklist in the Starcat external
integration design. At minimum verify:

- rapid input cancels stale CLI processes;
- all/local/GitHub source filtering;
- source labels and avatar fallback;
- local results open in Starcat;
- remote-only results open on GitHub;
- CLI missing, unpaired, non-Pro, disabled MCP, timeout, and upgrade messages;
- Apple Silicon and Intel macOS where available.

## Raycast Store submission

Raycast Store distribution is source-based. After all gates pass:

1. Update `package.json`, `CHANGELOG.md`, screenshots, and both READMEs.
2. Commit and push a clean release branch.
3. Run `npm run publish` manually.
4. Review the generated pull request against `raycast/extensions`.
5. Track review feedback and merge; do not publish an unsigned binary release.

CI deliberately never runs `npm run publish`. Store submission requires a
human-authenticated Raycast/GitHub session and is outside ordinary repository
builds.
