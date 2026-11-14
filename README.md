# FluxDown Classification

Version **1.5.0**. Completed file content requests a stable built-in save category. No filename/extension fallback, episode parsing, source-platform/creator/collection grouping, aliases or user-defined rules.

## Classification

The host recognizes local file content with bounded reads. The plugin maps host-observed facts to stable category IDs: `video`, `audio`, `document`, `image`, `program`, and `archive`. Presentation, spreadsheet, formula, subtitle, ebook and content-derived `text/*` MIME types request `document`; compressed formats request `archive`; executable and package formats request `program`.

- PNG content named `photo.txt` requests `image`.
- An extensionless PDF requests `document`.
- A ZIP named `book.epub` requests `archive`.
- Unknown, missing or unsupported recognition stays in place, even if the filename or source suggests a known type.
- Original filenames are preserved. Video files do not gain author, collection or episode-title subdirectories.

The host resolves each stable built-in category ID to its configured visible category and save directory. Hidden, unconfigured or missing categories stay in place; arbitrary custom category names are not inferred. The plugin does not know or display the resolved path. The host owns path validation, conflict handling and file movement. It does not read, execute, extract, upload or rename files. Explicit save directories bypass automatic routing.

## BT and groups

At first completion, exactly one selected non-padding BT file can be classified, including one selected file from a multi-file torrent. The host reads that actual final file and moves the whole task root through its BT storage migration, preserving internal relative paths and boundary pieces, then restores seeding. Multiple selections, explicit directories, recognition errors and move conflicts stay in place. There is no repeated automatic move on reseeding, restart or later selection changes. Location updates are asynchronous after completion.

Task groups have no single recognized file content and are not classified by this plugin. Member paths are preserved.

## Preview

Open **Classification preview**. Simulate kind, content MIME, detected format extension, start/completion and group state. Display filenames are not classification inputs. The preview displays the requested category ID only; it cannot show the host-resolved visible category or save directory.

There are no editable classification settings. Historical `ruleDocument`, `rules`, `aliases` and `videoGrouping` values are no longer consumed. Built-in mappings update only with the plugin; no remote rule feed or scheduled download is configured.

## Host contract

Requires FluxDown 0.6.5 or later with explicit `categoryRouting: true` support in the archive context. Older hosts and hosts without this capability are explicitly rejected.

The callback uses `phase`, `isGroup`, `categoryRouting` and host-observed `detectedType` (`kind`, `mime`, `extension`). Source metadata, original filenames and dates do not determine classification. Ordinary files defer until completion; groups return `null`. Successful classification returns one stable built-in category ID. No raw bytes or local filesystem paths are exposed to the plugin.

## Build and verify

```text
node --test scripts/parser.test.mjs
node build.mjs
```

Build bundles only internal rules, classifier, parser and entrypoints into `dist/` and produces `anime-archive-1.5.0.fxplug`. No vendored filename parser or Node/npm runtime dependency remains. Windows uses PowerShell compression; macOS/Linux use `zip`.

## 1.5.0 changes

- Replaced fixed directory labels with stable built-in category IDs resolved by the host.
- Require explicit host `categoryRouting` capability and reject older hosts.
- Preview shows only the requested category ID, not an assumed save directory.
