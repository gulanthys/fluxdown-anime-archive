# FluxDown Classification

Version **1.2.0**. Classification rules, directory layouts and the settings view live in this plugin. FluxDown only validates and applies the returned relative directory components. This version requires a matching development host with the `directories` archive-result contract; the manifest's base minimum version alone does not establish support in an already released app.

## Common downloads

For the Bilibili video `BV17vs96LEPD`, source metadata produces:

```text
<download root>/视频/哔哩哔哩/小猪仔步履不停/小猪仔评财报/<original filename>.mp4
```

The platform, creator and collection come from the resolver's `archiveMetadata`, not from reading video contents. Missing optional layers are omitted. Other source platforms use the same fields; YouTube, Douyin, TikTok and Niconico have display-name mappings. Series metadata contributes a series directory. Recognized episode filenames still use bundled MIT `anitomy@0.0.35` as a fallback, preserving title digits.

The bundled rules also cover documents, images, music, ebooks, archives and software by **filename extension**. This is not magic-byte, OCR or semantic content recognition. Unknown formats are unchanged. Files are not executed, extracted, uploaded or renamed by this plugin. User-authorized explicit save directories bypass automatic routing. Task groups are routed once by the host and retain their member relative paths.

## Rules and layouts

`rules.json` is a declarative version 1 seed. `classifiers` determine a stable category; `layouts` turn facts into directory segments. Each list uses its first matching rule. A custom `ruleDocument` is a complete personal document, not a merge: no matching layout means unchanged. It is stored in plugin settings and is not replaced by plugin updates. An empty override selects the bundled seed.

```json
{
  "version": 1,
  "classifiers": [
    {
      "id": "video",
      "when": { "field": "extension", "in": ["mp4", "mkv", "webm"] },
      "category": "video"
    }
  ],
  "layouts": [
    {
      "id": "by-source",
      "when": { "field": "category", "equals": "video" },
      "directories": [
        { "text": "视频" },
        { "field": "platformName", "onMissing": "omit" },
        { "field": "creatorName", "onMissing": "omit" },
        { "field": "collectionTitle", "onMissing": "omit" }
      ]
    }
  ]
}
```

Conditions support `{ "all": [...] }`, `{ "any": [...] }`, `{ "not": condition }` and field operations `equals`, `in`, `glob`, `exists`. `glob` matches the entire value, ignores case and supports `*` and `?`; `?` matches one Unicode code point. Other comparisons are exact. Missing/empty fields do not match except `exists: false`.

Available facts: `fileName`, lowercase `extension`, `platform`, `platformName`, `mediaKind`, `creatorId`, `creatorName`, `seriesId`, `seriesTitle`, `collectionId`, `collectionTitle`. Layouts additionally see `category`. Facts absent from the resolver remain absent; there is no extra platform lookup from the classifier. Classifiers are evaluated before category exists.

Segments contain either `text` or `field`. Field missing policies are `omit`, `rejectLayout` (default), or `fallback` with a `fallback` string. Literal separators, absolute paths and reserved names are rejected. Dynamic field values are cleaned into **one** directory component; slashes in a creator name do not create extra levels. Limits: 128 classifiers/layouts each, 8 condition nesting levels, 32 children per condition group, 64 values per `in`, 8 directory components, bounded rule text, and 180 UTF-8 bytes for the complete relative directory path. Preview and runtime both leave overlong results unchanged. The host independently validates all output and rejects unsafe destinations.

The initial practical implementation uses explicit series/collection fields rather than an arbitrary hierarchy-expansion language. It has no rule scripts, environment expansion or arbitrary filesystem access.

## Settings and preview

Open the plugin's **Classification rules** settings view:

- Preview one or more filenames and optionally paste source metadata JSON.
- Edit the classification/layout document, then **Validate and save rules**. Invalid documents are rejected before saving. Failed settings writes leave the confirmed configuration active.
- **Use bundled rules** clears the personal override.
- Aliases rename display directories, including stable keys such as `bilibili:creator:3707002469485044`.
- Existing ordered filename rules take priority over declarative rules: exclude, assign a sanitized single folder (with regex `$1` captures), or include normal parsing.
- Creator/collection grouping remains selectable; automatic mode uses the complete source hierarchy.

Updating the bundled `rules.json` and rebuilding updates the seed without modifying parser logic. Personal rule documents can be pasted independently. **No remote feed, automatic scheduled rule download or publisher key is configured by this package.** The host's existing signed `archiveRules` facility uses a different payload and is not presented as a subscription for this rule document.

## Build and verify

```text
node --test scripts/parser.test.mjs
node build.mjs
```

The build bundles `rules.json`, `classifier.js`, `parser.js`, vendored anitomy and the entrypoints into `dist/` and creates `anime-archive-1.2.0.fxplug`. Runtime needs no Node or npm dependencies. The archive callback returns `{ "directories": ["视频", "哔哩哔哩", "作者", "合集"] }` or the existing `{ "folderName": "override" }` for legacy assigned-folder rules. The host owns directory creation, conflict handling, file movement, task-location updates and group structure.

## 1.2.0 changes

- Independent multi-level directory output, with practical source and extension-based defaults.
- Separate declarative classifiers and layouts, bounded boolean conditions and missing-field policies.
- Personal rule-document editor with matching live preview, validation and reset.
- Existing aliases and ordered filename overrides retained; unknown input is left unchanged.
- New hosts must implement the multi-level callback contract; old released hosts are not silently treated as compatible.
