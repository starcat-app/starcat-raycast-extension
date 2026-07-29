# Changelog

All notable changes to Starcat Raycast Extension are documented here.

## Unreleased

### Fixed

- Normalize release archive timestamps to UTC for cross-timezone checksums.

## [1.0.0] - 2026-07-30

### Added

- Raycast repository search backed by `starcat search`.
- All, local, and GitHub source filters.
- Source attribution, language, stars, descriptions, and GitHub avatars.
- Local results open in Starcat; remote-only results open on GitHub.
- CLI path preference, cancellation, timeout, output limits, stable errors,
  schema v1 validation, URL allowlists, tests, and CI.
- Tag-driven GitHub Release workflow with source archives, SHA-256 checksums,
  and artifact attestations.
