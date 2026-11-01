# FluxDown Classification

A local-only FluxDown archive plugin, version **1.1.0**. The archive entry accepts `{ fileName, metadata?, isGroup }` and returns one sanitized title directory; FluxDown remains responsible for category routing and the download root. It uses source metadata first (series, creator, collection), then a supported video-filename fallback. This is not semantic content recognition: it does not inspect file contents, and it has no specialized software/archive engines. Source filenames are never renamed and there are no quality folders.

## Configuration

Settings are host-persisted and edited in the plugin settings view. Aliases map parsed titles or stable entity keys (for example `bilibili:creator:42`) to display names. Ordered rules support `AND` / `OR` / `NOT` conditions over filename extension and filename regexes; matching rules can exclude, assign a folder, or include default parsing. A matched regex can supply `$1` capture values in the folder template. Rule order and the configured video grouping preference determine classification. The same parser drives routing and live filename preview.

Batch preview shows each candidate's proposed folder and reason. Enable **Task group preview** to preview an extensionless group name with source metadata. For a real group, routing is applied once at its root only when all members have the same category; member relative paths and filenames are preserved.

Archive routing is local-only: no network requests or runtime dependencies are used. Invalid archive output fails open and leaves the normal download routing in place.

## Build and test

Build the `anime-archive-1.1.0.fxplug` package with `node build.mjs`; run parser tests with `node --test scripts/parser.test.mjs`. The build bundles the shared parser and vendored parser library into the plugin; Node is used only for build and tests, not at runtime.

The manifest requires `permissions: ["archive"]`, `contributes.archive` and `minAppVersion: "0.6.4"`. Archive routing requires a matching development host that implements this contract; this requirement does not imply availability in a released host.

## 1.1.0 changes

- Source-provided series, creator and collection identities now drive video grouping, with vendored MIT `anitomy@0.0.35` as the supported video-filename fallback.
- Documents, images, music and ebooks can use ordered extension/regex rules. Unknown files remain unchanged; there are no automatic content classifiers or specialized software/archive engines.
- Group routing preserves the group name and member subdirectories; choosing an explicit save directory bypasses it.
- The portable settings view uses host-supported node keys and events. Successful saves immediately update the preview; failed saves preserve the last confirmed configuration.
