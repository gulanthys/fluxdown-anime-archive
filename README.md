# Anime Archive

A local-only FluxDown archive plugin. The archive entry accepts a filename and returns one sanitized title directory; FluxDown remains responsible for its normal category routing and download root. It recognizes common episode forms (English `SxxExx` / `2x03`, Chinese `第xx集/话/季`, and fansub `Title - 01 [1080p]`). Explicit seasons are stripped from the folder name so all seasons group under one anime title. Non-video files and unrecognized filenames are left untouched. Source filenames are never renamed and there are no quality folders.

Install from the generated `anime-archive-1.0.1.fxplug` package using `node build.mjs`. Test the parser using `node --test scripts/parser.test.mjs`. The build bundles the shared parser into both entries; archive routing requires a host build that implements archive contributions.

Manifest requires `permissions: ["archive"]` and `contributes.archive`. `minAppVersion` is set to the current development baseline `0.6.4`; actual archive routing requires a host build that implements the archive capability, and is not implied to exist in released builds. Settings are host-persisted and edited in the plugin settings view: aliases map parsed titles to display names; ordered regex rules can exclude, assign a title, or include default parsing. The same parser drives routing and live filename preview.
