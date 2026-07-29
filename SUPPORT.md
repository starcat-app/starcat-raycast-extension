# Support

Before opening an issue:

```bash
starcat version
starcat doctor
```

Confirm that Starcat MCP Service is enabled, the CLI is paired, and Raycast's
**Starcat CLI Path** preference points to an executable absolute path when the
default lookup cannot find it.

Use [GitHub Issues](https://github.com/starcat-app/starcat-raycast-extension/issues)
for reproducible extension defects and feature requests. Include:

- macOS, Raycast, Starcat, CLI, and extension versions;
- whether the source filter was All, Local, or GitHub;
- sanitized reproduction steps and the stable `STARCAT_ERROR` code;
- whether `starcat search "<query>" --source all --limit 30` succeeds.

Do not include tokens, pairing profiles, private repository names, raw stderr,
or private local paths.

For Starcat product and account support, use
[starcat-pro](https://github.com/starcat-app/starcat-pro). Report security
issues privately as described in [SECURITY.md](./SECURITY.md).
