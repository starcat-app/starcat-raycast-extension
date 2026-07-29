# Privacy

Starcat Raycast Extension is a local launcher adapter. It does not operate an
independent backend, collect analytics, or persist search history.

## Data flow

When a user searches:

1. Raycast passes the query to this extension.
2. The extension passes it as one argv element to the locally installed
   `starcat search` command.
3. Starcat performs local repository search and, when requested, GitHub Search
   under Starcat's existing account and privacy settings.
4. The extension receives the resulting JSON and renders a transient Raycast
   list.

## Storage

The extension does not persist:

- search queries or results;
- private repository names or descriptions;
- Starcat pairing data or local API keys;
- GitHub tokens;
- CLI stdout or stderr;
- avatar files.

Raycast may retain its own command history and preferences according to the
user's Raycast settings. The optional CLI path preference is stored by Raycast.

## Network access

The extension does not call the Starcat MCP endpoint or GitHub API directly.
Starcat may call GitHub when the selected source includes GitHub. Raycast may
load public owner or organization avatars from allowlisted GitHub HTTPS hosts;
the bundled fallback icon is used when an avatar is missing or rejected.

Raycast, Starcat, GitHub, npm, Homebrew, and macOS remain governed by their own
privacy settings and policies.
