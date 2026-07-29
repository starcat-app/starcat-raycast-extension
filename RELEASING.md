# Releasing

## Version policy

Raycast extensions do not declare a `version` property in `package.json`. The
Store exposes one implicit latest version and automatically updates users after
an accepted submission. Repository milestones start at `1.0.0` and use
`vMAJOR.MINOR.PATCH` Git tags plus matching `CHANGELOG.md` sections; they do not
control Raycast Store updates.

## Release gates

Use Node.js 22.22.2 or newer, then run:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
bash -n scripts/*.sh
scripts/package-release.sh v1.0.0 HEAD
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

## GitHub Release

Push a version tag only after the matching commit is on `main`:

```bash
git tag -a v1.0.0 -m "Starcat Raycast Extension v1.0.0"
git push origin v1.0.0
```

The tag-triggered workflow reruns every automated gate, creates reproducible
source `.zip` / `.tar.gz` archives, verifies `checksums.txt`, records GitHub
artifact attestations, and publishes the GitHub Release. Validate the public
release title, target commit, assets, SHA-256 values, and attestation before
announcing it.

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
