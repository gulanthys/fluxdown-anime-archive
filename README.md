# FluxDown Classification

Version **1.6.1**. Completed downloads can be archived by content category, completion date, or both. No filename/extension fallback, episode parsing, source-platform/creator/collection grouping, aliases or user-defined rules.

Plugin identity remains `gulanthys@anime-archive`, matching previously published packages so existing installations retain their update identity.

## Archive layout

In the plugin’s basic settings, choose **Archive layout** (**归档方式** in the Simplified Chinese UI). **Classification preview** is a separate view, not the archive setting.

| Layout | Example |
| --- | --- |
| Category only (default) | `Downloads/图片` |
| Completion day or month only | `Downloads/20260731` or `Downloads/202607` |
| Category / completion day or month | `Downloads/图片/20260731` or `Downloads/图片/202607` |

Date layouts use the FluxDown host's local date at completion, after post-processing. Date-only uses the task's authorized default directory even if the host initially routed it to a category. Combined layouts append a date to the configured category directory; unknown content or a missing category directory uses the authorized default directory instead. The host creates the date directory and moves the file; existing path and conflict checks still apply.

Date layouts require a FluxDown build that advertises `completedDate` to the archive callback. Hosts without it, and BT tasks on supporting hosts, keep category-only routing. Explicit save directories, eD2K downloads and task groups are not date-bucketed.

## Classification

The host recognizes local file content with bounded reads. The plugin maps host-observed facts to stable category IDs: `video`, `audio`, `document`, `image`, `program`, and `archive`. Presentation, spreadsheet, formula, subtitle, ebook and content-derived `text/*` MIME types request `document`; compressed formats request `archive`; executable and package formats request `program`.

- PNG content named `photo.txt` requests `image`.
- An extensionless PDF requests `document`.
- A ZIP named `book.epub` requests `archive`.
- In category-only mode, unknown, missing or unsupported recognition does not request a category, even if the filename or source suggests a known type.
- Original filenames are preserved. Video files do not gain author, collection or episode-title subdirectories.

The host resolves each stable built-in category ID to its configured visible category and save directory. Hidden, unconfigured or missing categories stay in place; arbitrary custom category names are not inferred. The plugin does not know or display the resolved path. The host owns path validation, conflict handling and file movement. It does not read, execute, extract, upload or rename files. Explicit save directories bypass automatic routing.

## BT and groups

At first completion, exactly one selected non-padding BT file can be classified, including one selected file from a multi-file torrent. The host reads that actual final file and moves the whole task root through its BT storage migration, preserving internal relative paths and boundary pieces, then restores seeding. Multiple selections, explicit directories, recognition errors and move conflicts stay in place. There is no repeated automatic move on reseeding, restart or later selection changes. Location updates are asynchronous after completion.

Task groups have no single recognized file content and are not classified by this plugin. Member paths are preserved.

## Preview

Open **Classification preview**. Simulate kind, content MIME, detected format extension, start/completion and group state. Display filenames are not classification inputs. The preview displays the requested category ID only; it cannot show the host-resolved visible category or save directory.

Historical `ruleDocument`, `rules`, `aliases` and `videoGrouping` values are no longer consumed. Built-in mappings update only with the plugin; no remote rule feed or scheduled download is configured.

## Host contract

Requires FluxDown 0.6.5 or later with explicit `categoryRouting: true` support in the archive context. Older hosts and hosts without this capability are explicitly rejected.

Classification uses `phase`, `isGroup`, `categoryRouting` and host-observed `detectedType` (`kind`, `mime`, `extension`). Ordinary files defer until completion; groups return `null`. Date layouts request `dateBucket: "day" | "month"`, optionally with a built-in `category` ID, only when `completedDate` is present. The host derives the folder name from its own date. No raw bytes or local filesystem paths are exposed to the plugin.

## Build and verify

```text
node --test scripts/parser.test.mjs
node build.mjs
```

Build bundles only internal rules, classifier, parser and entrypoints into `dist/` and produces `anime-archive-1.6.1.fxplug`. No vendored filename parser or Node/npm runtime dependency remains. Windows uses PowerShell compression; macOS/Linux use `zip`.

## 1.6.1 changes

- Declare explicit English and Chinese setting translations required by the plugin market.

## 1.6.0 changes

- Added a persisted archive layout setting for category-only, completion-date-only, and category-then-date routing.
- Kept category-only as the default and compatibility behavior.

## 1.5.0 changes

- Replaced fixed directory labels with stable built-in category IDs resolved by the host.
- Require explicit host `categoryRouting` capability and reject older hosts.
- Preview shows only the requested category ID, not an assumed save directory.
