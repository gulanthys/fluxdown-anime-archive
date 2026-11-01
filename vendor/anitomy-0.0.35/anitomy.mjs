function inRange(list, idx) {
  return 0 <= idx && idx < list.length;
}
function isNumericString(text) {
  return /^\d+(\.\d)?$/.test(text);
}
function trim(text, removal) {
  let start = 0, end = text.length - 1;
  while (start <= end && removal.includes(text[start])) {
    start++;
  }
  while (end >= start && removal.includes(text[end])) {
    end--;
  }
  return text.slice(start, end + 1);
}
function mergeResult(source, income = {}) {
  return {
    ...source,
    ...income
  };
}

var ElementCategory = /* @__PURE__ */ ((ElementCategory2) => {
  ElementCategory2["AnimeSeason"] = "season";
  ElementCategory2["AnimeSeasonPrefix"] = "prefix.season";
  ElementCategory2["AnimeTitle"] = "title";
  ElementCategory2["AnimeType"] = "type";
  ElementCategory2["AnimeYear"] = "year";
  ElementCategory2["AnimeMonth"] = "month";
  ElementCategory2["DeviceCompatibility"] = "DeviceCompatibility";
  ElementCategory2["Source"] = "source";
  ElementCategory2["EpisodeNumber"] = "episode.number";
  ElementCategory2["EpisodeNumberAlt"] = "episode.numberAlt";
  ElementCategory2["EpisodePrefix"] = "prefix.episode";
  ElementCategory2["EpisodeTitle"] = "episode.title";
  ElementCategory2["FileChecksum"] = "checksum";
  ElementCategory2["FileExtension"] = "extension";
  ElementCategory2["FileName"] = "filename";
  ElementCategory2["Language"] = "language";
  ElementCategory2["Subtitles"] = "subtitles";
  ElementCategory2["AudioTerm"] = "audio.term";
  ElementCategory2["VideoResolution"] = "video.resolution";
  ElementCategory2["VideoTerm"] = "video.term";
  ElementCategory2["VolumeNumber"] = "volume";
  ElementCategory2["VolumePrefix"] = "prefix.volume";
  ElementCategory2["ReleaseGroup"] = "release.group";
  ElementCategory2["ReleaseInformation"] = "release.information";
  ElementCategory2["ReleaseVersion"] = "release.version";
  ElementCategory2["Unknown"] = "unknown";
  ElementCategory2["Other"] = "other";
  return ElementCategory2;
})(ElementCategory || {});

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const keys = /* @__PURE__ */ new Map();
const extensions = /* @__PURE__ */ new Map();
class KeywordManager {
  static normalize(text) {
    return text.toLocaleUpperCase();
  }
  static contains(category, keyword) {
    const map = this.container(category);
    const value = map.get(keyword);
    return value && value.category === category;
  }
  static container(category) {
    return category === "extension" ? this.extensions : this.keys;
  }
  static find(keyword, category) {
    const map = this.container(category);
    if (!map.has(keyword)) {
      return void 0;
    }
    const entry = map.get(keyword);
    if (category !== "unknown" && entry.category !== category) {
      return void 0;
    }
    return entry;
  }
  static peek(range) {
    const search = range.toString();
    const result = {};
    const predefined = [];
    for (const { category, list } of this.peekEntries) {
      for (const key of list) {
        const foundIdx = search.indexOf(key);
        if (foundIdx === -1)
          continue;
        result[category] = key;
        predefined.push(range.fork(foundIdx + range.offset, key.length));
      }
    }
    return { result, predefined };
  }
}
__publicField$2(KeywordManager, "keys", keys);
__publicField$2(KeywordManager, "extensions", extensions);
__publicField$2(KeywordManager, "peekEntries", [
  { category: ElementCategory.AudioTerm, list: ["Dual Audio"] },
  { category: ElementCategory.VideoTerm, list: ["H264", "H.264", "h264", "h.264"] },
  {
    category: ElementCategory.VideoResolution,
    list: ["480p", "480P", "720p", "720P", "1080p", "1080P"]
  },
  { category: ElementCategory.Source, list: ["Blu-Ray"] }
]);
(() => {
  const optionsDefault = { identifiable: true, searchable: true, valid: true };
  const optionsInvalid = { identifiable: false, searchable: false, valid: false };
  const optionsUnidentifiable = {
    identifiable: false,
    searchable: true,
    valid: true
  };
  const optionsUnidentifiableInvalid = {
    identifiable: false,
    searchable: true,
    valid: false
  };
  const optionsUnidentifiableUnsearchable = {
    identifiable: false,
    searchable: false,
    valid: true
  };
  add(ElementCategory.AnimeSeasonPrefix, optionsUnidentifiable, ["SAISON", "SEASON"]);
  add(ElementCategory.AnimeType, optionsUnidentifiable, [
    "GEKIJOUBAN",
    "MOVIE",
    "OAD",
    "OAV",
    "ONA",
    "OVA",
    "SPECIAL",
    "SPECIALS",
    "TV",
    "\u7279\u522B\u7BC7",
    "\u7279\u5225\u7BC7",
    "\u7279\u5225\u7DE8",
    "\u7279\u522B\u8BDD",
    "\u7279\u5225\u8BDD",
    "\u7279\u5225\u8A71",
    "\u756A\u5916\u7BC7",
    "\u756A\u5916\u7DE8"
  ]);
  add(ElementCategory.AnimeType, optionsUnidentifiableUnsearchable, ["SP"]);
  add(ElementCategory.AnimeType, optionsUnidentifiableInvalid, [
    "ED",
    "ENDING",
    "NCED",
    "NCOP",
    "OP",
    "OPENING",
    "PREVIEW",
    "PV"
  ]);
  add(ElementCategory.AudioTerm, optionsDefault, [
    // Audio channels
    "2.0CH",
    "2CH",
    "5.1",
    "5.1CH",
    "DTS",
    "DTS-ES",
    "DTS5.1",
    "TRUEHD5.1",
    // Audio codec
    "AAC",
    "AACX2",
    "AACX3",
    "AACX4",
    "AC3",
    "EAC3",
    "E-AC-3",
    "FLAC",
    "FLACX2",
    "FLACX3",
    "FLACX4",
    "LOSSLESS",
    "MP3",
    "OGG",
    "VORBIS",
    // Audio language
    "DUALAUDIO",
    "DUAL AUDIO"
  ]);
  add(ElementCategory.VideoTerm, optionsDefault, [
    // Frame rate
    "23.976FPS",
    "24FPS",
    "29.97FPS",
    "30FPS",
    "60FPS",
    "120FPS",
    // Video codec
    "8BIT",
    "8-BIT",
    "10BIT",
    "10BITS",
    "10-BIT",
    "10-BITS",
    "HI10",
    "HI10P",
    "HI444",
    "HI444P",
    "HI444PP",
    "H264",
    "H265",
    "H.264",
    "H.265",
    "X264",
    "X265",
    "X.264",
    "AVC",
    "HEVC",
    "HEVC2",
    "HEVC-10BIT",
    "DIVX",
    "DIVX5",
    "DIVX6",
    "XVID",
    // Video format
    "AVI",
    "RMVB",
    "WMV",
    "WMV3",
    "WMV9",
    // Video quality
    "HQ",
    "LQ",
    // Video resolution
    "HD",
    "SD"
  ]);
  add(ElementCategory.Source, optionsDefault, [
    "BD",
    "BDRIP",
    "BLURAY",
    "BLU-RAY",
    "DVD",
    "DVD5",
    "DVD9",
    "DVD-R2J",
    "DVDRIP",
    "DVD-RIP",
    "R2DVD",
    "R2J",
    "R2JDVD",
    "R2JDVDRIP",
    "HDTV",
    "HDTVRIP",
    "TVRIP",
    "TV-RIP",
    "WEBCAST",
    "WEBDL",
    "WEB-DL",
    "WEBRIP",
    "WEB-RIP"
  ]);
  add(ElementCategory.Language, optionsDefault, [
    "ENG",
    "ENGLISH",
    "ESPANO",
    "JAP",
    "PT-BR",
    "SPANISH",
    "VOSTFR",
    // feat: chinese
    "CHT",
    "CHS",
    "\u7B80\u4E2D",
    "\u7E41\u4E2D",
    "\u7B80\u4F53",
    "\u7E41\u9AD4"
  ]);
  add(ElementCategory.Language, optionsUnidentifiable, ["ESP", "ITA"]);
  add(ElementCategory.Subtitles, optionsDefault, [
    "ASS",
    "GB",
    // feat: 简体字幕
    "BIG5",
    "DUB",
    "DUBBED",
    "HARDSUB",
    "HARDSUBS",
    "RAW",
    "SOFTSUB",
    "SOFTSUBS",
    "SUB",
    "SUBBED",
    "SUBTITLED"
  ]);
  add(ElementCategory.EpisodePrefix, optionsDefault, [
    "EP",
    "EP.",
    "EPS",
    "EPS.",
    "EPISODE",
    "EPISODE.",
    "EPISODES",
    "CAPITULO",
    "EPISODIO",
    "FOLGE"
  ]);
  add(ElementCategory.EpisodePrefix, optionsInvalid, ["E", "\\x7B2C"]);
  add(ElementCategory.VolumePrefix, optionsDefault, ["VOL", "VOL.", "VOLUME"]);
  add(ElementCategory.ReleaseGroup, optionsDefault, ["Baha", "THORA"]);
  add(ElementCategory.ReleaseInformation, optionsDefault, [
    "BATCH",
    "COMPLETE",
    "PATCH",
    "REMUX"
  ]);
  add(ElementCategory.ReleaseInformation, optionsUnidentifiable, ["END", "FINAL"]);
  add(ElementCategory.ReleaseVersion, optionsDefault, [
    "V0",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9"
  ]);
  add(ElementCategory.Other, optionsDefault, [
    "REMASTER",
    "REMASTERED",
    "UNCENSORED",
    "UNCUT",
    "TS",
    "VFR",
    "WIDESCREEN",
    "WS"
  ]);
  add(ElementCategory.FileExtension, optionsDefault, [
    "3GP",
    "AVI",
    "DIVX",
    "FLV",
    "M2TS",
    "MKV",
    "MOV",
    "MP4",
    "MPG",
    "OGM",
    "RM",
    "RMVB",
    "TS",
    "WEBM",
    "WMV"
  ]);
  add(ElementCategory.FileExtension, optionsInvalid, [
    "AAC",
    "AIFF",
    "FLAC",
    "M4A",
    "MP3",
    "MKA",
    "OGG",
    "WAV",
    "WMA",
    "7Z",
    "RAR",
    "ZIP",
    "ASS",
    "SRT"
  ]);
  function add(category, options, input) {
    const map = category === "extension" ? extensions : keys;
    for (const key of input) {
      if (!map.has(key)) {
        map.set(key, { category, ...options });
      }
    }
  }
})();
const Fansubs = /* @__PURE__ */ new Set([
  "\u730E\u6237\u53D1\u5E03\u7EC4",
  "\u730E\u6237\u624B\u6284\u90E8",
  "\u5317\u5B87\u6CBB\u5B57\u5E55\u7EC4",
  "\u5317\u5B87\u6CBBAnarchism\u5B57\u5E55\u7EC4",
  "\u52D5\u6F2B\u82B1\u5712",
  "\u62E8\u96EA\u5BFB\u6625",
  "NC-Raws",
  "\u55B5\u840C\u5976\u8336\u5C4B",
  "Lilith-Raws",
  "\u9B54\u661F\u5B57\u5E55\u56E2",
  "\u685C\u90FD\u5B57\u5E55\u7EC4",
  "\u5929\u6708\u52D5\u6F2B&\u767C\u4F48\u7D44",
  "\u6781\u5F71\u5B57\u5E55\u793E",
  "LoliHouse",
  "\u60A0\u54C8C9\u5B57\u5E55\u793E",
  "\u5E7B\u6708\u5B57\u5E55\u7EC4",
  "\u5929\u4F7F\u52A8\u6F2B\u8BBA\u575B",
  "\u52A8\u6F2B\u56FD\u5B57\u5E55\u7EC4",
  "\u5E7B\u6A31\u5B57\u5E55\u7EC4",
  "\u7231\u604B\u5B57\u5E55\u793E",
  "DBD\u5236\u4F5C\u7EC4",
  "c.c\u52A8\u6F2B",
  "\u841D\u8389\u793E\u6D3B\u52A8\u5BA4",
  "\u5343\u590F\u5B57\u5E55\u7EC4",
  "IET\u5B57\u5E55\u7D44",
  "\u8BF8\u795Ekamigami\u5B57\u5E55\u7EC4",
  "\u971C\u5EAD\u4E91\u82B1Sub",
  "GMTeam",
  "\u98CE\u8F66\u5B57\u5E55\u7EC4",
  // '雪飄工作室(FLsnow)',
  "MCE\u6C49\u5316\u7EC4",
  "\u4E38\u5B50\u5BB6\u65CF",
  "\u661F\u7A7A\u5B57\u5E55\u7EC4",
  "\u68A6\u84DD\u5B57\u5E55\u7EC4",
  "LoveEcho!",
  "SweetSub",
  "\u67AB\u53F6\u5B57\u5E55\u7EC4",
  "Little Subbers!",
  "\u8F7B\u4E4B\u56FD\u5EA6",
  "\u4E91\u5149\u5B57\u5E55\u7EC4",
  "\u8C4C\u8C46\u5B57\u5E55\u7EC4",
  "\u9A6F\u517D\u5E08\u8054\u76DF",
  "\u4E2D\u80AF\u5B57\u5E55\u7D44",
  "SW\u5B57\u5E55\u7EC4",
  "\u94F6\u8272\u5B50\u5F39\u5B57\u5E55\u7EC4",
  "\u98CE\u4E4B\u5723\u6BBF",
  "YWCN\u5B57\u5E55\u7EC4",
  "KRL\u5B57\u5E55\u7EC4",
  "\u534E\u76DF\u5B57\u5E55\u793E",
  "\u6CE2\u6D1B\u5496\u5561\u5385",
  "\u52A8\u97F3\u6F2B\u5F71",
  "VCB-Studio",
  "DHR\u52D5\u7814\u5B57\u5E55\u7D44",
  "80v08",
  "\u80A5\u732B\u538B\u5236",
  "Little\u5B57\u5E55\u7EC4",
  "AI-Raws",
  "\u79BB\u8C31Sub",
  "\u8679\u54B2\u5B66\u56ED\u70E4\u8089\u540C\u597D\u4F1A",
  "ARIA\u5427\u6C49\u5316\u7EC4",
  "\u67EF\u5357\u4E8B\u52A1\u6240",
  "\u767E\u51AC\u7DF4\u7FD2\u7D44",
  "\u51B7\u756A\u8865\u5B8C\u5B57\u5E55\u7EC4",
  "\u7231\u5495\u5B57\u5E55\u7EC4",
  "\u6975\u5F69\u5B57\u5E55\u7EC4",
  "AQUA\u5DE5\u4F5C\u5BA4",
  "\u672A\u592E\u9601\u8054\u76DF",
  "\u5C4A\u604B\u5B57\u5E55\u7EC4",
  "\u591C\u83BA\u5BB6\u65CF",
  "TD-RAWS",
  "\u5922\u5E7B\u6200\u6AFB",
  "WBX-SUB",
  "Liella!\u306E\u70E7\u70E4\u644A",
  "Amor\u5B57\u5E55\u7EC4",
  "MingYSub",
  "\u5C0F\u767DGM",
  "Sakura",
  "EMe",
  "Alchemist",
  "\u9ED1\u5CA9\u5C04\u624B\u5427\u5B57\u5E55\u7EC4",
  "ANi",
  "MSB\u5236\u4F5C\u7D44"
]);

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class TextRange {
  constructor(text, offset, size) {
    __publicField$1(this, "text");
    __publicField$1(this, "offset");
    __publicField$1(this, "size");
    this.text = text;
    this.offset = offset;
    this.size = size;
  }
  fork(offset, size) {
    return new TextRange(this.text, offset, size);
  }
  toString() {
    return this.text.slice(this.offset, this.offset + this.size);
  }
}
var TokenCategory = /* @__PURE__ */ ((TokenCategory2) => {
  TokenCategory2["Unknown"] = "Unknown";
  TokenCategory2["Bracket"] = "Bracket";
  TokenCategory2["Delimiter"] = "Delimiter";
  TokenCategory2["Identifier"] = "Identifier";
  TokenCategory2["Invalid"] = "Invalid";
  return TokenCategory2;
})(TokenCategory || {});
var TokenFlag = /* @__PURE__ */ ((TokenFlag2) => {
  TokenFlag2[TokenFlag2["None"] = 0] = "None";
  TokenFlag2[TokenFlag2["Bracket"] = 1] = "Bracket";
  TokenFlag2[TokenFlag2["NotBracket"] = 2] = "NotBracket";
  TokenFlag2[TokenFlag2["Delimiter"] = 3] = "Delimiter";
  TokenFlag2[TokenFlag2["NotDelimiter"] = 4] = "NotDelimiter";
  TokenFlag2[TokenFlag2["Identifier"] = 5] = "Identifier";
  TokenFlag2[TokenFlag2["NotIdentifier"] = 6] = "NotIdentifier";
  TokenFlag2[TokenFlag2["Unknown"] = 7] = "Unknown";
  TokenFlag2[TokenFlag2["NotUnknown"] = 8] = "NotUnknown";
  TokenFlag2[TokenFlag2["Valid"] = 9] = "Valid";
  TokenFlag2[TokenFlag2["NotValid"] = 10] = "NotValid";
  TokenFlag2[TokenFlag2["Enclosed"] = 11] = "Enclosed";
  TokenFlag2[TokenFlag2["NotEnclosed"] = 12] = "NotEnclosed";
  return TokenFlag2;
})(TokenFlag || {});
function checkTokenFlags(token, flags) {
  if (flags.some((f) => f === 11 /* Enclosed */ || f === 12 /* NotEnclosed */)) {
    const success = flags.includes(11 /* Enclosed */) === token.enclosed;
    if (!success)
      return false;
  }
  if (!flags.some((f) => 1 /* Bracket */ <= f && f <= 10 /* NotValid */)) {
    return true;
  }
  const tasks = [
    [1 /* Bracket */, 2 /* NotBracket */, "Bracket" /* Bracket */],
    [3 /* Delimiter */, 4 /* NotDelimiter */, "Delimiter" /* Delimiter */],
    [5 /* Identifier */, 6 /* NotIdentifier */, "Identifier" /* Identifier */],
    [7 /* Unknown */, 8 /* NotUnknown */, "Unknown" /* Unknown */],
    [10 /* NotValid */, 9 /* Valid */, "Invalid" /* Invalid */]
  ];
  for (const [fe, fn, c] of tasks) {
    const success = flags.includes(fe) ? token.category === c : flags.includes(fn) && token.category !== c;
    if (success)
      return true;
  }
  return false;
}
function findNextToken(tokens, position, ...flags) {
  for (let i = position + 1; i < tokens.length; i++) {
    if (tokens[i] && checkTokenFlags(tokens[i], flags)) {
      return i;
    }
  }
  return tokens.length;
}
function findPrevToken(tokens, position, ...flags) {
  for (let i = position - 1; i >= 0; i--) {
    if (tokens[i] && checkTokenFlags(tokens[i], flags)) {
      return i;
    }
  }
  return -1;
}
function findToken(tokens, start, end, ...flags) {
  for (let i = start; i < end; i++) {
    if (tokens[i] && checkTokenFlags(tokens[i], flags)) {
      return i;
    }
  }
  return -1;
}

function isCRC32(str) {
  return /^[0-9a-fA-F]{8}$/.test(str);
}
function isResolution(str) {
  return /^\d{3,4}([pP]|[xX\u00D7]\d{3,4})/.test(str);
}
const SearchableElementCategories = /* @__PURE__ */ new Set([
  ElementCategory.AnimeSeasonPrefix,
  ElementCategory.AnimeType,
  ElementCategory.AudioTerm,
  ElementCategory.DeviceCompatibility,
  ElementCategory.EpisodePrefix,
  ElementCategory.FileChecksum,
  ElementCategory.FileExtension,
  ElementCategory.Language,
  ElementCategory.Other,
  ElementCategory.ReleaseGroup,
  ElementCategory.ReleaseInformation,
  ElementCategory.ReleaseVersion,
  ElementCategory.Source,
  ElementCategory.Subtitles,
  ElementCategory.VideoResolution,
  ElementCategory.VideoTerm,
  ElementCategory.VolumePrefix
]);
function isElementCategorySearchable(category) {
  return SearchableElementCategories.has(category);
}
const SingularElementCategories = /* @__PURE__ */ new Set([
  ElementCategory.AnimeSeason,
  ElementCategory.AnimeType,
  ElementCategory.AudioTerm,
  ElementCategory.DeviceCompatibility,
  ElementCategory.EpisodeNumber,
  ElementCategory.Language,
  ElementCategory.Other,
  ElementCategory.ReleaseInformation,
  ElementCategory.Source,
  ElementCategory.VideoTerm
]);
function isElementCategorySingular(category) {
  return !SingularElementCategories.has(category);
}
const Ordinals = /* @__PURE__ */ new Map([
  ["1st", "1"],
  ["First", "1"],
  ["2nd", "2"],
  ["Second", "2"],
  ["3rd", "3"],
  ["Third", "3"],
  ["4th", "4"],
  ["Fourth", "4"],
  ["5th", "5"],
  ["Fifth", "5"],
  ["6th", "6"],
  ["Sixth", "6"],
  ["7th", "7"],
  ["Seventh", "7"],
  ["8th", "8"],
  ["Eighth", "8"],
  ["9th", "9"],
  ["Ninth", "9"]
]);
function getNumberFromOrdinal(str) {
  return Ordinals.has(str) ? Ordinals.get(str) : void 0;
}
function isMatchTokenCategory(category, token) {
  return token?.category === category;
}
const Dashes = "-\u2010\u2011\u2012\u2013\u2014\u2015";
function isDashCharacter(c) {
  return c.length === 1 && Dashes.includes(c);
}
function isLatinChar(c) {
  return c[0] <= "\u024F";
}
function isMostlyLatinString(str) {
  if (str.length === 0)
    return false;
  return str.split("").filter(isLatinChar).length / str.length >= 0.6;
}

function setResult(context, category, word) {
  context.result[category] = word;
}
function hasResult(context, category) {
  const value = context.result[category];
  return value !== void 0 && value !== null && value !== "";
}
function getResult(context, category) {
  return context.result[category];
}

function matchVolumePatterns(context, word, token) {
  return true;
}

function searchForEpisodePatterns(context, tokens) {
  for (const it of tokens) {
    const token = context.tokens[it];
    const numericFront = token.content.length > 0 && /0-9/.test(token.content[0]);
    if (!numericFront) {
      if (numberComesAfterPrefix(context, ElementCategory.EpisodePrefix, token)) {
        return true;
      }
      if (numberComesAfterPrefix(context, ElementCategory.VolumePrefix, token)) {
        return true;
      }
    } else {
      if (numberComesBeforeAnotherNumber(context, it)) {
        return true;
      }
    }
    if (matchEpisodePatterns(context, token.content, token)) {
      return true;
    }
  }
  return false;
}
function numberComesAfterPrefix(context, category, token) {
  const numberBegin = indexOfDigit(token.content);
  const prefix = KeywordManager.normalize(token.content.slice(0, numberBegin));
  if (!KeywordManager.contains(category, prefix))
    return false;
  const num = token.content.slice(numberBegin);
  switch (category) {
    case ElementCategory.EpisodePrefix:
      if (!matchEpisodePatterns(context, num, token)) {
        setEpisodeNumber(context, num, token, false);
      }
      return true;
    case ElementCategory.VolumePrefix:
      return true;
  }
  return false;
}
function numberComesBeforeAnotherNumber(context, position) {
  const separatorToken = findPrevToken(context.tokens, position, TokenFlag.NotDelimiter);
  if (!inRange(context.tokens, separatorToken))
    return false;
  const separators = [
    ["&", true],
    ["of", false]
  ];
  for (const sep of separators) {
    if (context.tokens[separatorToken].content !== sep[0])
      continue;
    const otherToken = findNextToken(context.tokens, separatorToken, TokenFlag.NotDelimiter);
    if (!inRange(context.tokens, otherToken) || !isNumericString(context.tokens[otherToken].content)) {
      continue;
    }
    setEpisodeNumber(context, context.tokens[position].content, context.tokens[position], false);
    if (sep[1]) {
      setEpisodeNumber(
        context,
        context.tokens[otherToken].content,
        context.tokens[otherToken],
        false
      );
    }
    context.tokens[separatorToken].category = TokenCategory.Identifier;
    context.tokens[otherToken].category = TokenCategory.Identifier;
    return true;
  }
  return false;
}
function matchEpisodePatterns(context, word, token) {
  if (isNumericString(word))
    return false;
  word = trim(word, [" ", "-"]);
  const numericFront = isDigit(word[0]);
  const numericBack = isDigit(word[word.length - 1]);
  if (numericFront && numericBack) {
    if (matchSingleEpisodePattern(context, word, token)) {
      return true;
    }
  }
  if (numericFront) {
    if (matchMultiEpisodePattern(context, word, token)) {
      return true;
    }
  }
  if (numericBack) {
    if (matchSeasonAndEpisodePattern(context, word, token)) {
      return true;
    }
    if (matchNumberSignPattern(context, word, token)) {
      return true;
    }
  }
  if (!numericFront && matchTypeAndEpisodePattern(context, word, token)) {
    return true;
  }
  if (numericFront && !numericBack && matchPartialEpisodePattern(context, word, token)) {
    return true;
  }
  if (matchJapaneseCounterPattern(context, word, token)) {
    return true;
  }
  return false;
}
function matchSingleEpisodePattern(context, word, token) {
  const RE = /^(\d{1,3})[vV](\d)$/;
  const match = RE.exec(word);
  if (match) {
    setEpisodeNumber(context, match[1], token, false);
    setResult(context, ElementCategory.ReleaseVersion, match[2]);
    return true;
  } else {
    return false;
  }
}
function matchMultiEpisodePattern(context, word, token) {
  const RE = /^(\d{1,3})(?:[vV](\d))?[-~&+](\d{1,3})(?:[vV](\d)|[Ff][Ii][Nn]|[Ee][Nn][Dd]|合集)?$/;
  const match = RE.exec(word);
  if (!match)
    return false;
  const lowerBound = match[1];
  const upperBound = match[3];
  if (+lowerBound <= +upperBound) {
    if (setEpisodeNumber(context, lowerBound, token, true)) {
      setEpisodeNumber(context, upperBound, token, true);
      if (match[2]) {
        setResult(context, ElementCategory.ReleaseVersion, match[2]);
      }
      if (match[4]) {
        setResult(context, ElementCategory.ReleaseVersion, match[4]);
      }
      return true;
    }
  }
  return false;
}
function matchSeasonAndEpisodePattern(context, word, token) {
  const RE = /^S?(\d{1,2})(?:-S?(\d{1,2}))?(?:x|[ ._-x]?E)(\d{1,3})(?:-E?(\d{1,3}))?$/;
  const match = RE.exec(word);
  if (!match)
    return false;
  setResult(context, ElementCategory.AnimeSeason, match[1]);
  if (match[2]) {
    setResult(context, ElementCategory.AnimeSeason, match[2]);
  }
  setEpisodeNumber(context, match[3], token, false);
  if (match[4]) {
    setEpisodeNumber(context, match[4], token, false);
  }
  return true;
}
function matchNumberSignPattern(context, word, token) {
  if (word[0] !== "#")
    word = "";
  const RE = /^#(\d{1,3})(?:[-~&+](\d{1,3}))?(?:[vV](\d))?$/;
  const match = RE.exec(word);
  if (!match)
    return false;
  if (!setEpisodeNumber(context, match[1], token, true))
    return false;
  if (match[2]) {
    setEpisodeNumber(context, match[2], token, false);
  }
  if (match[3]) {
    setResult(context, ElementCategory.ReleaseVersion, match[3]);
  }
  return true;
}
function matchTypeAndEpisodePattern(context, word, token) {
  const numberBegin = indexOfDigit(word);
  const prefix = word.slice(0, numberBegin);
  const entry = KeywordManager.find(KeywordManager.normalize(prefix), ElementCategory.AnimeType);
  if (entry) {
    setResult(context, entry.category, prefix);
    const num = word.slice(numberBegin);
    if (matchEpisodePatterns(context, num, token) || setEpisodeNumber(context, num, token, true)) {
      const foundIdx = context.tokens.indexOf(token);
      if (foundIdx !== -1) {
        token.content = num;
        context.tokens.splice(foundIdx, 0, {
          category: entry.identifiable ? TokenCategory.Identifier : TokenCategory.Unknown,
          content: prefix,
          enclosed: token.enclosed
        });
      }
      return true;
    }
  }
  return false;
}
function matchPartialEpisodePattern(context, word, token) {
  if (!word)
    return false;
  let foundIdx = word.length;
  for (let i = 0; i < word.length; i++) {
    if (!isDigit(word[i])) {
      foundIdx = i;
      break;
    }
  }
  const suffix = word.slice(foundIdx);
  const valid = ["a", "b", "c", "fin", "end"];
  return valid.includes(suffix.toLocaleLowerCase()) && setEpisodeNumber(context, word, token, true);
}
function matchJapaneseCounterPattern(context, word, token) {
  const hua = ["\u8A71", "\u8BDD", "\u96C6"];
  if (word.length > 0 && hua.includes(word.at(-1))) {
    const RE = /^第?(\d{1,4})(?:-(\d{1,4}))?(?:[vV](\d))?(?:話|话|集)$/;
    const match = RE.exec(word);
    if (!match)
      return false;
    setEpisodeNumber(context, match[1], token, false);
    if (match[2]) {
      setEpisodeNumber(context, match[2], token, false);
    }
    if (match[3]) {
      setResult(context, ElementCategory.ReleaseVersion, match[3]);
    }
    return true;
  }
  return false;
}
function setEpisodeNumber(context, num, token, validate) {
  if (validate && !isValidEpisodeNumber(num))
    return false;
  token.category = TokenCategory.Identifier;
  if (hasResult(context, ElementCategory.EpisodeNumber)) {
    const oldEp = getResult(context, ElementCategory.EpisodeNumber);
    const diff = +num - +oldEp;
    if (diff > 0) {
      setResult(context, ElementCategory.EpisodeNumberAlt, num);
      return true;
    } else if (diff < 0) {
      setResult(context, ElementCategory.EpisodeNumber, num);
      setResult(context, ElementCategory.EpisodeNumberAlt, oldEp);
      return true;
    } else {
      return false;
    }
  } else {
    setResult(context, ElementCategory.EpisodeNumber, num);
    return true;
  }
}

function checkAndSetAnimeSeasonKeyword(context, position) {
  const tokens = context.tokens;
  const token = tokens[position];
  const prevToken = findPrevToken(tokens, position, TokenFlag.NotDelimiter);
  if (inRange(tokens, prevToken)) {
    const num = getNumberFromOrdinal(tokens[prevToken].content);
    if (num) {
      setAnimeSeason(tokens[prevToken], token, num);
      return;
    }
  }
  const nextToken = findNextToken(tokens, position, TokenFlag.NotDelimiter);
  if (!inRange(tokens, nextToken) || !isNumericString(tokens[nextToken].content)) {
    return void 0;
  }
  return setAnimeSeason(token, tokens[nextToken], tokens[nextToken].content);
  function setAnimeSeason(first, second, content) {
    first.category = TokenCategory.Identifier;
    second.category = TokenCategory.Identifier;
    setResult(context, ElementCategory.AnimeSeason, content);
  }
}
function checkAndSetAnimeSeason(context, position) {
  const token = context.tokens[position];
  if (matchPrefixS()) {
    return true;
  }
  if (matchPrefixChinese()) {
    return true;
  }
  if (matchFullChinese()) {
    return true;
  }
  return false;
  function matchPrefixS() {
    const RE = /^S-?(\d{1,3})$/;
    const match = RE.exec(token.content);
    if (!match)
      return false;
    setResult(context, ElementCategory.AnimeSeason, match[1]);
    return true;
  }
  function matchPrefixChinese() {
    const RE = /^第(\d+)季$/;
    const match = RE.exec(token.content);
    if (!match)
      return false;
    setResult(context, ElementCategory.AnimeSeason, match[1]);
    return true;
  }
  function matchFullChinese() {
    const RE = /^第(十?[零一二三四五六七八九十])季$/;
    const match = RE.exec(token.content);
    if (!match)
      return false;
    setResult(context, ElementCategory.AnimeSeason, extractNumber(match[1]));
    return true;
    function extractNumber(word) {
      const DICT = {
        \u96F6: "0",
        \u4E00: "1",
        \u4E8C: "2",
        \u4E09: "3",
        \u56DB: "4",
        \u4E94: "5",
        \u516D: "6",
        \u4E03: "7",
        \u516B: "8",
        \u4E5D: "9",
        \u5341: "10"
      };
      if (word.length === 1) {
        return DICT[word[0]];
      } else {
        return "1" + DICT[word[1]];
      }
    }
  }
}
function checkAndSetAnimeMonth(context, position) {
  const word = trim(context.tokens[position].content, ["\u2605"]);
  const RE = /^(\d{1,2})月新番$/;
  const match = RE.exec(word);
  if (!match)
    return false;
  context.tokens[position].category = TokenCategory.Identifier;
  setResult(context, ElementCategory.AnimeMonth, match[1]);
  return true;
}
function checkAndSetReleaseGroup(context, position) {
  const list = context.tokens[position].content.split(/&/);
  const ok = list.every(
    (f) => Fansubs.has(f) || f.endsWith("\u5B57\u5E55\u7EC4") || f.endsWith("\u5B57\u5E55\u7D44") || f.endsWith("\u5B57\u5E55\u793E")
  );
  if (ok) {
    context.tokens[position].category = TokenCategory.Identifier;
    setResult(context, ElementCategory.ReleaseGroup, context.tokens[position].content);
    return true;
  }
  return false;
}
function checkExtentKeyword(context, category, position) {
  const tokens = context.tokens;
  const token = tokens[position];
  const nextToken = findNextToken(tokens, position, TokenFlag.NotDelimiter);
  if (!isMatchTokenCategory(TokenCategory.Unknown, tokens[nextToken])) {
    return false;
  }
  if (indexOfDigit(tokens[nextToken].content) !== 0) {
    return false;
  }
  switch (category) {
    case ElementCategory.EpisodeNumber:
      if (!matchEpisodePatterns(context, tokens[nextToken].content, tokens[nextToken])) {
        setEpisodeNumber(context, tokens[nextToken].content, tokens[nextToken], false);
      }
      break;
    case ElementCategory.VolumeNumber:
      if (!matchVolumePatterns(context, tokens[nextToken].content, tokens[nextToken])) ;
      break;
  }
  token.category = TokenCategory.Identifier;
  return true;
}
function buildElement(context, category, keepDelimiters, tokens) {
  const element = [];
  for (const token of tokens) {
    switch (token.category) {
      case TokenCategory.Unknown:
        element.push(token.content);
        token.category = TokenCategory.Identifier;
        break;
      case TokenCategory.Bracket:
        element.push(token.content);
        break;
      case TokenCategory.Delimiter:
        const delimiter = token.content[0] ?? "";
        if (keepDelimiters) {
          element.push(delimiter);
        } else {
          switch (delimiter) {
            case ",":
            case "&":
              element.push(delimiter);
              break;
            default:
              element.push(" ");
              break;
          }
        }
        break;
    }
  }
  if (!keepDelimiters) {
    const t = trim(element.join(""), " -\u2010\u2011\u2012\u2013\u2014\u2015".split(""));
    element.splice(0, element.length, t);
  }
  const title = element.join("");
  if (title) {
    setResult(context, category, title);
  }
}
function isTokenIsolated(context, position) {
  const prevToken = findPrevToken(context.tokens, position, TokenFlag.NotDelimiter);
  if (!isMatchTokenCategory(TokenCategory.Bracket, context.tokens[prevToken]))
    return false;
  const nextToken = findNextToken(context.tokens, position, TokenFlag.NotDelimiter);
  return isMatchTokenCategory(TokenCategory.Bracket, context.tokens[nextToken]);
}

const AnimeYearMin = 1900;
const AnimeYearMax = 2100;
const EpisodeNumberMax = AnimeYearMax - 1;
function indexOfDigit(str) {
  for (let i = 0; i < str.length; i++) {
    if (isDigit(str[i])) {
      return i;
    }
  }
  return -1;
}
function isDigit(str) {
  return /^[0-9]$/.test(str);
}
function searchForEquivalentNumbers(context, tokens) {
  for (const it of tokens) {
    if (isTokenIsolated(context, it) || !isValidEpisodeNumber(context.tokens[it].content)) {
      continue;
    }
    let nextToken = findNextToken(context.tokens, it, TokenFlag.NotDelimiter);
    if (isMatchTokenCategory(TokenCategory.Bracket, context.tokens[nextToken])) {
      nextToken = findNextToken(
        context.tokens,
        nextToken,
        TokenFlag.Enclosed,
        TokenFlag.NotDelimiter
      );
      if (isMatchTokenCategory(TokenCategory.Unknown, context.tokens[nextToken])) {
        if (isTokenIsolated(context, nextToken) && isNumericString(context.tokens[nextToken].content) && isValidEpisodeNumber(context.tokens[nextToken].content)) {
          setEpisodeNumber(
            context,
            context.tokens[nextToken].content,
            context.tokens[nextToken],
            true
          );
          return true;
        }
      }
    }
  }
  return false;
}
function searchForSeparatedNumbers(context, tokens) {
  for (const it of tokens) {
    const prevToken = findPrevToken(context.tokens, it, TokenFlag.NotDelimiter);
    if (isMatchTokenCategory(TokenCategory.Unknown, context.tokens[prevToken]) && isDashCharacter(context.tokens[prevToken].content[0])) {
      if (setEpisodeNumber(context, context.tokens[it].content, context.tokens[it], true)) {
        context.tokens[prevToken].category = TokenCategory.Identifier;
        return true;
      }
    }
  }
  return false;
}
function searchForIsolatedEpisodeNumber(context, tokens) {
  {
    const isolated = tokens.filter(
      (it) => context.tokens[it].enclosed && isTokenIsolated(context, it)
    );
    for (const it of isolated.reverse()) {
      if (setEpisodeNumber(context, context.tokens[it].content, context.tokens[it], true)) {
        return true;
      }
    }
  }
  {
    const isolated = tokens.filter((it) => context.tokens[it].enclosed);
    for (const it of isolated.reverse()) {
      const prevToken = findPrevToken(context.tokens, it, TokenFlag.NotDelimiter);
      if (!isMatchTokenCategory(TokenCategory.Bracket, context.tokens[prevToken]))
        continue;
      const nextToken = findNextToken(context.tokens, it, TokenFlag.NotDelimiter);
      const nextnextToken = findNextToken(context.tokens, nextToken, TokenFlag.NotDelimiter);
      if (!isMatchTokenCategory(TokenCategory.Bracket, context.tokens[nextnextToken]))
        continue;
      if (setEpisodeNumber(context, context.tokens[it].content, context.tokens[it], true)) {
        return true;
      }
    }
  }
  return false;
}
function searchForEpisodeNumberWithVersion(context, tokens) {
  const enclosed = tokens.filter((it) => context.tokens[it].enclosed);
  for (const it of enclosed) {
    const nextToken = findNextToken(context.tokens, it, TokenFlag.NotDelimiter);
    const nextContent = context.tokens[nextToken].content;
    if (/^[vV]\d+$/.test(nextContent)) {
      if (setEpisodeNumber(context, context.tokens[it].content, context.tokens[it], true)) {
        context.tokens[it].category = TokenCategory.Identifier;
        return true;
      }
    }
  }
  return false;
}
function searchForLastNumber(context, tokens) {
  for (const it of tokens) {
    if (it === 0)
      continue;
    if (context.tokens[it].enclosed)
      continue;
    if (context.tokens.slice(0, it).every((t) => t.enclosed || t.category === TokenCategory.Delimiter)) {
      continue;
    }
    const prevToken = findPrevToken(context.tokens, it, TokenFlag.NotDelimiter);
    if (isMatchTokenCategory(TokenCategory.Unknown, context.tokens[prevToken])) {
      const prevContent = context.tokens[prevToken].content;
      if (prevContent === "Movie" || prevContent === "Part") {
        continue;
      }
    }
    if (matchFractionalEpisodePattern(context, context.tokens[it].content, context.tokens[it])) {
      return true;
    }
    if (setEpisodeNumber(context, context.tokens[it].content, context.tokens[it], true)) {
      return true;
    }
  }
  return false;
}
function isValidEpisodeNumber(num) {
  const temp = [];
  for (let i = 0; i < num.length && /[0-9\.]/.test(num[i]); i++) {
    temp.push(num[i]);
  }
  return temp.length > 0 && parseFloat(temp.join("")) <= EpisodeNumberMax;
}
function matchFractionalEpisodePattern(context, word, token) {
  const RE = /^\d+\.5$/;
  const match = RE.exec(word);
  return match && setEpisodeNumber(context, word, token, true);
}

function parse$1(result, tokens, options) {
  const context = {
    tokens,
    options,
    result,
    isEpisodeKeywordsFound: false
  };
  searchForKeywords(context);
  searchForIsolatedNumbers(context);
  if (options.parseEpisodeNumber) {
    searchForEpisodeNumber(context);
  }
  searchForAnimeTitle(context);
  if (options.parseReleaseGroup && !hasResult(context, ElementCategory.ReleaseGroup)) ;
  if (options.parseEpisodeTitle && hasResult(context, ElementCategory.EpisodeNumber)) ;
  return {
    ok: hasResult(context, ElementCategory.AnimeTitle),
    result: context.result
  };
}
function searchForKeywords(context) {
  const tokens = context.tokens;
  const options = context.options;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.category !== TokenCategory.Unknown)
      continue;
    let word = trim(token.content, [" ", "-"]);
    if (word === "")
      continue;
    if (word.length !== 8 && isNumericString(word))
      continue;
    let category = ElementCategory.Unknown;
    const keyword = KeywordManager.normalize(word);
    const found = KeywordManager.find(keyword, ElementCategory.Unknown);
    if (found) {
      category = found.category;
      if (!options.parseReleaseGroup && category === ElementCategory.ReleaseGroup) {
        continue;
      }
      if (!isElementCategorySearchable(category) || !found.searchable) {
        continue;
      }
      if (isElementCategorySingular(category) && hasResult(context, category)) {
        continue;
      }
      switch (found.category) {
        case ElementCategory.AnimeSeasonPrefix:
          checkAndSetAnimeSeasonKeyword(context, i);
          continue;
        case ElementCategory.EpisodePrefix:
          if (found.valid) {
            checkExtentKeyword(context, ElementCategory.EpisodeNumber, i);
          }
          continue;
        case ElementCategory.ReleaseVersion:
          word = word.slice(1);
          break;
        case ElementCategory.VolumePrefix:
          checkExtentKeyword(context, ElementCategory.VolumeNumber, i);
          continue;
      }
    } else {
      if (checkAndSetAnimeSeason(context, i)) {
        continue;
      }
      if (checkAndSetAnimeMonth(context, i)) {
        continue;
      }
      if (checkAndSetReleaseGroup(context, i)) {
        continue;
      }
      if (!hasResult(context, ElementCategory.FileChecksum) && isCRC32(word)) {
        category = ElementCategory.FileChecksum;
      } else if (!hasResult(context, ElementCategory.VideoResolution) && isResolution(word)) {
        category = ElementCategory.VideoResolution;
      }
      {
        const found2 = KeywordManager.find(keyword, ElementCategory.FileExtension);
        if (found2) {
          category = found2.category;
        }
      }
    }
    if (category !== ElementCategory.Unknown) {
      setResult(context, category, word);
      if (!found || found.identifiable) {
        token.category = TokenCategory.Identifier;
      }
    }
  }
}
function searchForIsolatedNumbers(context) {
  for (let i = 0; i < context.tokens.length; i++) {
    const token = context.tokens[i];
    if (token.category !== TokenCategory.Unknown || !isNumericString(token.content) || !isTokenIsolated(context, i)) {
      continue;
    }
    const num = +token.content;
    if (AnimeYearMin <= num && num <= AnimeYearMax) {
      if (!hasResult(context, ElementCategory.AnimeYear)) {
        setResult(context, ElementCategory.AnimeYear, token.content);
        token.category = TokenCategory.Identifier;
        continue;
      }
    }
    if (num !== 480 && num !== 720 && num !== 1080)
      continue;
    if (hasResult(context, ElementCategory.VideoResolution))
      continue;
    setResult(context, ElementCategory.VideoResolution, token.content);
    token.category = TokenCategory.Identifier;
  }
}
function searchForEpisodeNumber(context) {
  const tokens = context.tokens.map((token, idx) => [token, idx]).filter(
    // fix: only use Unknown token and it must have digit char
    ([token]) => token.category === TokenCategory.Unknown && indexOfDigit(token.content) !== -1
  ).map(([_token, idx]) => idx);
  if (tokens.length === 0)
    return;
  context.isEpisodeKeywordsFound = hasResult(context, ElementCategory.EpisodeNumber);
  if (searchForEpisodePatterns(context, tokens))
    return;
  context.isEpisodeKeywordsFound = hasResult(context, ElementCategory.EpisodeNumber);
  if (context.isEpisodeKeywordsFound)
    return;
  tokens.splice(
    0,
    tokens.length,
    ...tokens.filter((t) => isNumericString(context.tokens[t].content))
  );
  if (searchForEquivalentNumbers(context, tokens))
    return;
  if (searchForSeparatedNumbers(context, tokens))
    return;
  if (searchForIsolatedEpisodeNumber(context, tokens))
    return;
  if (searchForEpisodeNumberWithVersion(context, tokens))
    return;
  searchForLastNumber(context, tokens);
}
function searchForAnimeTitle(context) {
  let enclosedTitle = false;
  let tokenBegin = findToken(
    context.tokens,
    0,
    context.tokens.length,
    TokenFlag.NotEnclosed,
    TokenFlag.Unknown
  );
  if (!inRange(context.tokens, tokenBegin)) {
    tokenBegin = 0;
    enclosedTitle = true;
    do {
      tokenBegin = findToken(context.tokens, tokenBegin, context.tokens.length, TokenFlag.Unknown);
      if (!inRange(context.tokens, tokenBegin))
        break;
      if (!isMostlyLatinString(context.tokens[tokenBegin].content)) {
        break;
      }
      tokenBegin = findToken(context.tokens, tokenBegin, context.tokens.length, TokenFlag.Bracket);
      if (!inRange(context.tokens, tokenBegin))
        break;
      tokenBegin = findToken(context.tokens, tokenBegin, context.tokens.length, TokenFlag.Unknown);
    } while (inRange(context.tokens, tokenBegin));
  }
  if (!inRange(context.tokens, tokenBegin))
    return;
  let tokenEnd = findToken(
    context.tokens,
    tokenBegin,
    context.tokens.length,
    TokenFlag.Identifier,
    enclosedTitle ? TokenFlag.Bracket : TokenFlag.None
  );
  if (!enclosedTitle) {
    let lastBracket = tokenEnd;
    let bracketOpen = false;
    for (let i = tokenBegin; i < tokenEnd; i++) {
      if (context.tokens[i].category === TokenCategory.Bracket) {
        lastBracket = i;
        bracketOpen = !bracketOpen;
      }
    }
    if (bracketOpen)
      tokenEnd = lastBracket;
  }
  if (!enclosedTitle) {
    let token = findPrevToken(context.tokens, tokenEnd, TokenFlag.NotDelimiter);
    while (isMatchTokenCategory(TokenCategory.Bracket, context.tokens[token]) && context.tokens[token].content[0] != ")") {
      token = findPrevToken(context.tokens, token, TokenFlag.Bracket);
      if (inRange(context.tokens, token)) {
        tokenEnd = token;
        token = findPrevToken(context.tokens, tokenEnd, TokenFlag.NotDelimiter);
      }
    }
  }
  buildElement(
    context,
    ElementCategory.AnimeTitle,
    false,
    context.tokens.slice(tokenBegin, tokenEnd)
  );
}

const Brackets = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["\u300C", "\u300D"],
  ["\u300E", "\u300F"],
  ["\u3010", "\u3011"],
  ["\uFF08", "\uFF09"]
];
function tokenize(filename, options) {
  let result = {};
  const tokens = [];
  tokenizeByBrackets();
  return { ok: tokens.length > 0, result, tokens };
  function addToken(category, enclosed, range) {
    tokens.push({
      category,
      content: range.toString(),
      enclosed
    });
  }
  function tokenizeByBrackets() {
    let isBracketOpen = false;
    let matchingBracket = void 0;
    for (let i = 0; i < filename.length; ) {
      const foundIdx = !isBracketOpen || !matchingBracket ? findFirstBracket(i, filename.length) : filename.indexOf(matchingBracket, i);
      const range = new TextRange(filename, i, foundIdx === -1 ? filename.length : foundIdx - i);
      if (range.size > 0) {
        tokenizeByPreidentified(isBracketOpen, range);
      }
      if (foundIdx !== -1) {
        addToken(TokenCategory.Bracket, true, range.fork(range.offset + range.size, 1));
        isBracketOpen = !isBracketOpen;
        i = foundIdx + 1;
      } else {
        break;
      }
    }
    function findFirstBracket(start, end) {
      for (let i = start; i < end; i++) {
        for (const [left, right] of Brackets) {
          if (filename[i] === left) {
            matchingBracket = right;
            return i;
          }
        }
      }
      return -1;
    }
  }
  function tokenizeByPreidentified(enclosed, range) {
    const { result: _result, predefined } = KeywordManager.peek(range);
    result = mergeResult(result, _result);
    let offset = range.offset;
    let subRange = range.fork(range.offset, 0);
    while (offset < range.offset + range.size) {
      for (const predefToken of predefined) {
        if (offset !== predefToken.offset)
          continue;
        if (subRange.size > 0) {
          tokenizeByDelimiters(enclosed, subRange);
        }
        addToken(TokenCategory.Identifier, enclosed, predefToken);
        subRange.offset = predefToken.offset + predefToken.size;
        offset = subRange.offset - 1;
      }
      subRange.size = ++offset - subRange.offset;
    }
    if (subRange.size > 0) {
      tokenizeByDelimiters(enclosed, subRange);
    }
  }
  function tokenizeByDelimiters(enclosed, range) {
    const delimiters = getDelimiters(range);
    if (delimiters.size === 0) {
      addToken(TokenCategory.Unknown, enclosed, range);
      return;
    }
    for (let i = range.offset, end = range.offset + range.size; i < end; ) {
      let found = end;
      for (let j = i; j < end && j < range.text.length; j++) {
        if (delimiters.has(range.text[j])) {
          found = j;
          break;
        }
      }
      const subRange = range.fork(i, found - i);
      if (subRange.size > 0) {
        addToken(TokenCategory.Unknown, enclosed, subRange);
      }
      if (found !== end) {
        addToken(
          TokenCategory.Delimiter,
          enclosed,
          subRange.fork(subRange.offset + subRange.size, 1)
        );
        i = found + 1;
      } else {
        break;
      }
    }
    validateDelimiterTokens();
  }
  function getDelimiters(range) {
    const delimiters = /* @__PURE__ */ new Set();
    for (let i = range.offset; i < range.offset + range.size; i++) {
      if (options.delimiters.includes(range.text[i])) {
        delimiters.add(range.text[i]);
      }
    }
    return delimiters;
  }
  function validateDelimiterTokens() {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.category !== TokenCategory.Delimiter) {
        if (token.content === "\u6211\u63A8\u7684\u5B69\u5B50") {
          if (tokens[i - 1]?.content === "\u3010" && tokens[i + 1]?.content === "\u3011") {
            tokens[i - 1].category = TokenCategory.Invalid;
            tokens[i].content = "\u3010\u6211\u63A8\u7684\u5B69\u5B50\u3011";
            tokens[i].enclosed = false;
            tokens[i + 1].category = TokenCategory.Invalid;
          }
        }
        continue;
      }
      const delimiter = token.content[0];
      const prevToken = findPrevToken(tokens, i, TokenFlag.Valid);
      let nextToken = findNextToken(tokens, i, TokenFlag.Valid);
      if (![" ", "_"].includes(delimiter)) {
        if (isSingleCharacterToken(prevToken)) {
          appendTokenTo(token, tokens[prevToken]);
          while (isUnknownToken(nextToken)) {
            appendTokenTo(tokens[nextToken], tokens[prevToken]);
            nextToken = findNextToken(tokens, i, TokenFlag.Valid);
            if (!isDelimiterToken(nextToken) || tokens[nextToken].content[0] !== delimiter)
              continue;
            appendTokenTo(tokens[nextToken], tokens[prevToken]);
            nextToken = findNextToken(tokens, nextToken, TokenFlag.Valid);
          }
          continue;
        }
        if (isSingleCharacterToken(nextToken)) {
          appendTokenTo(token, tokens[prevToken]);
          appendTokenTo(tokens[nextToken], tokens[prevToken]);
          continue;
        }
      }
      if (isUnknownToken(prevToken) && isDelimiterToken(nextToken)) {
        const nextDelimiter = tokens[nextToken].content[0];
        if (delimiter !== nextDelimiter && delimiter !== ",") {
          if (delimiter === " " || nextDelimiter === "_") {
            appendTokenTo(token, tokens[prevToken]);
          }
        }
      } else if (isDelimiterToken(prevToken) && isDelimiterToken(nextToken)) {
        const prevDelimiter = tokens[prevToken].content[0];
        const nextDelimiter = tokens[nextToken].content[0];
        if (prevDelimiter === nextDelimiter && prevDelimiter != delimiter) {
          token.category = TokenCategory.Unknown;
        }
      }
      if (!["&", "+"].includes(delimiter))
        continue;
      if (!isUnknownToken(prevToken) || !isUnknownToken(nextToken))
        continue;
      if (!isNumericString(tokens[prevToken].content) || !isNumericString(tokens[nextToken].content)) {
        continue;
      }
      appendTokenTo(token, tokens[prevToken]);
      appendTokenTo(tokens[nextToken], tokens[prevToken]);
    }
    tokens.splice(0, tokens.length, ...tokens.filter((t) => t.category !== TokenCategory.Invalid));
    function isDelimiterToken(idx) {
      return inRange(tokens, idx) && tokens[idx].category === TokenCategory.Delimiter;
    }
    function isUnknownToken(idx) {
      return inRange(tokens, idx) && tokens[idx].category === TokenCategory.Unknown;
    }
    function isSingleCharacterToken(idx) {
      if (!inRange(tokens, idx))
        return false;
      const content = tokens[idx].content;
      return isUnknownToken(idx) && content.length === 1 && content !== "-";
    }
    function appendTokenTo(src, dst) {
      dst.content += src.content;
      src.category = TokenCategory.Invalid;
    }
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Parser {
  constructor(options = {}) {
    __publicField(this, "options");
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    this.options = resolveOptions(options);
  }
  parse(filename, force = false) {
    if (!force && this.cache.has(filename)) {
      const result = this.cache.get(filename);
      return result ? result : void 0;
    } else {
      const result = parse(filename, this.options);
      if (result) {
        this.cache.set(filename, result);
      } else {
        this.cache.set(filename, null);
      }
      return result;
    }
  }
}
function parse(filename, _options = {}) {
  if (filename === "")
    return void 0;
  let result = {};
  const options = resolveOptions(_options);
  result.filename = filename;
  if (options.parseFileExtension) {
    const ext = removeExtension(filename);
    if (ext) {
      result.filename = filename;
      result.extension = ext.extension;
    }
  }
  const tokenized = tokenize(result.filename, options);
  result = mergeResult(result, tokenized.result);
  if (!tokenized.ok) {
    return resolveResult(result);
  }
  const parsed = parse$1(result, tokenized.tokens, options);
  result = parsed.result;
  return resolveResult(result);
}
function resolveOptions(options) {
  return {
    delimiters: " _.&+,|",
    parseEpisodeNumber: true,
    parseEpisodeTitle: true,
    parseFileExtension: true,
    parseReleaseGroup: true,
    ...options
  };
}
function resolveResult(result) {
  const resolved = {
    title: result["title"],
    type: result["type"],
    season: normalizeSeason(result["season"]),
    year: normalizeNumber(result["year"]),
    month: normalizeNumber(result["month"]),
    language: result["language"],
    subtitles: result["subtitles"],
    source: result["source"],
    episode: {
      number: normalizeNumber(result["episode.number"]),
      numberAlt: normalizeNumber(result["episode.numberAlt"]),
      title: result["episode.title"]
    },
    volume: {
      number: normalizeNumber(result["volume"])
    },
    video: {
      term: result["video.term"],
      resolution: result["video.resolution"]
    },
    audio: {
      term: result["audio.term"]
    },
    release: {
      version: normalizeNumber(result["release.version"]),
      group: result["release.group"]
    },
    file: {
      name: result["filename"],
      extension: result["extension"],
      checksum: result["checksum"]
    }
  };
  return resolved;
  function normalizeSeason(num) {
    if (num !== void 0 && num !== null) {
      return /^\d+$/.test(num) ? String(+num) : num;
    } else {
      return void 0;
    }
  }
  function normalizeNumber(num) {
    try {
      if (num !== void 0 && num !== null) {
        const n = parseFloat(num);
        return !Number.isNaN(n) ? n : void 0;
      }
    } catch {
    }
    return void 0;
  }
}
function removeExtension(filename) {
  const position = filename.lastIndexOf(".");
  if (position === -1)
    return void 0;
  const extension = filename.slice(position + 1);
  if (extension.length > 4 || !/^[a-zA-Z0-0]+$/.test(extension)) {
    return void 0;
  }
  if (!KeywordManager.contains(ElementCategory.FileExtension, extension)) {
    return void 0;
  }
  return {
    filename: filename.slice(0, position),
    extension
  };
}

globalThis.AnitomyBundled = { parse };
