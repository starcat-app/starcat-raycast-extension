/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Starcat CLI Path - Optional absolute path to the Starcat CLI executable. */
  "starcatCliPath"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-repositories` command */
  export type SearchRepositories = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-repositories` command */
  export type SearchRepositories = {}
}

