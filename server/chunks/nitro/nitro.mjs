import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { LRUCache } from 'lru-cache';
import { createGenerator } from '@unocss/core';
import presetWind from '@unocss/preset-wind3';
import { parse } from 'devalue';
import { createConsola, consola } from 'consola';
import { createUnhead } from 'unhead';
import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync, mkdirSync } from 'node:fs';
import { resolve as resolve$2, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { toValue, isRef, hasInjectionContext, inject, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated } from 'vue';
import { toHast } from 'minimark/hast';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { createHead as createHead$1, propsToString } from 'unhead/server';
import { FlatMetaPlugin } from 'unhead/plugins';
import { walkResolver } from 'unhead/utils';
import { createRenderer } from 'vue-bundle-renderer/runtime';
import { renderToString } from 'vue/server-renderer';
import Database from 'better-sqlite3';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withoutLeadingSlash(input = "") {
  return (hasLeadingSlash(input) ? input.slice(1) : input) || "/";
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=g(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function g(...n){return function(...e){for(const t of n)t(...e);}}const m=_();class A extends m{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController: AbortController$1 });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive$1(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive$1(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$2 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$2,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {
  ["nuxt-og-image:fonts:Noto+Sans+SC-normal-400.ttf.base64"]: {
    import: () => import('../raw/Noto_Sans_SC-normal-400.ttf.mjs').then(r => r.default || r),
    meta: {"type":"text/plain; charset=utf-8","etag":"\"dd0828-22a5m8oJvGh93dea0lutvzW/UU0\"","mtime":"2025-08-25T09:20:56.232Z"}
  }
};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME$1 = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME$1, "base");
  }
  opts.base = resolve$2(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME$1,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME$1,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const defineAppConfig = (config) => config;

const appConfig0 = defineAppConfig({
  toaster: {
    expand: true,
    position: "top-right",
    duration: 3e3
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false
  },
  ui: {
    colors: {
      primary: "indigo",
      neutral: "zinc"
    },
    prose: {
      codeIcon: {
        "sh": "material-icon-theme:console",
        "tsconfig.json": "material-icon-theme:tsconfig",
        "ts": "material-icon-theme:typescript",
        "scss": "material-icon-theme:sass",
        "package.json": "material-icon-theme:nodejs",
        "d.ts": "material-icon-theme:typescript-def",
        "vite.config.ts": "material-icon-theme:vite",
        "yml": "material-icon-theme:yaml",
        "pnpm-workspace.yaml": "material-icon-theme:pnpm-light",
        "ecosystem.config.cjs": "material-icon-theme:pm2-ecosystem",
        "conf": "material-icon-theme:settings",
        "tree": "material-icon-theme:tree",
        ".env": "material-icon-theme:tune",
        "java": "material-icon-theme:java",
        "text": "material-icon-theme:document",
        "json": "material-icon-theme:json",
        "log": "material-icon-theme:log",
        "js": "material-icon-theme:javascript"
      }
    }
  },
  header: {
    github: "https://github.com/mhaibaraai/mhaibaraai.cn/blob/main/content",
    colorMode: true,
    search: true,
    links: [
      {
        "icon": "i-simple-icons-github",
        "to": "https://github.com/mhaibaraai/mhaibaraai.cn",
        "target": "_blank",
        "aria-label": "Open on GitHub"
      }
    ]
  },
  toc: {
    title: "\u9875\u9762\u5BFC\u822A",
    bottom: {
      title: "\u793E\u533A",
      edit: "https://github.com/mhaibaraai/mhaibaraai.cn/edit/main/content",
      links: [
        {
          icon: "i-lucide-star",
          label: "Star on GitHub",
          to: "https://github.com/mhaibaraai/mhaibaraai.cn",
          target: "_blank"
        },
        {
          icon: "i-lucide-circle-dot",
          label: "New Issue",
          to: "https://github.com/mhaibaraai/mhaibaraai.cn/issues/new",
          target: "_blank"
        },
        {
          icon: "i-lucide-brain",
          label: "LLMs",
          to: "https://mhaibaraai.cn/llms.txt",
          target: "_blank"
        },
        {
          icon: "i-lucide-link",
          label: "Link Checker",
          to: "https://mhaibaraai.cn/__link-checker__/link-checker-report.html",
          target: "_blank"
        }
      ]
    }
  },
  footer: {
    credits: `Copyright \xA9 2024 - ${(/* @__PURE__ */ new Date()).getFullYear()} YiXuan`,
    links: [
      {
        "icon": "i-tabler-brand-nuxt",
        "to": "https://nuxt.com/",
        "target": "_blank",
        "aria-label": "Nuxt Website"
      },
      {
        "icon": "i-tabler-mail",
        "to": "mailto:mhaibaraai@gmail.com",
        "target": "_blank",
        "aria-label": "YiXuan's Gmail"
      },
      {
        "icon": "i-lucide-brain",
        "to": "https://mhaibaraai.cn/llms.txt",
        "target": "_blank",
        "aria-label": "Open LLMs"
      },
      {
        "icon": "i-lucide-link",
        "to": "https://mhaibaraai.cn/__link-checker__/link-checker-report.html",
        "target": "_blank",
        "aria-label": "Open Link Checker"
      },
      {
        "icon": "i-simple-icons-github",
        "to": "https://github.com/mhaibaraai/mhaibaraai.cn",
        "target": "_blank",
        "aria-label": "Open on GitHub"
      }
    ]
  }
});

const inlineAppConfig = {
  "nuxt": {},
  "ui": {
    "colors": {
      "primary": "green",
      "secondary": "blue",
      "success": "green",
      "info": "blue",
      "warning": "yellow",
      "error": "red",
      "neutral": "slate"
    },
    "icons": {
      "arrowDown": "i-lucide-arrow-down",
      "arrowLeft": "i-lucide-arrow-left",
      "arrowRight": "i-lucide-arrow-right",
      "arrowUp": "i-lucide-arrow-up",
      "caution": "i-lucide-circle-alert",
      "check": "i-lucide-check",
      "chevronDoubleLeft": "i-lucide-chevrons-left",
      "chevronDoubleRight": "i-lucide-chevrons-right",
      "chevronDown": "i-lucide-chevron-down",
      "chevronLeft": "i-lucide-chevron-left",
      "chevronRight": "i-lucide-chevron-right",
      "chevronUp": "i-lucide-chevron-up",
      "close": "i-lucide-x",
      "copy": "i-lucide-copy",
      "copyCheck": "i-lucide-copy-check",
      "dark": "i-lucide-moon",
      "ellipsis": "i-lucide-ellipsis",
      "error": "i-lucide-circle-x",
      "external": "i-lucide-arrow-up-right",
      "eye": "i-lucide-eye",
      "eyeOff": "i-lucide-eye-off",
      "file": "i-lucide-file",
      "folder": "i-lucide-folder",
      "folderOpen": "i-lucide-folder-open",
      "hash": "i-lucide-hash",
      "info": "i-lucide-info",
      "light": "i-lucide-sun",
      "loading": "i-lucide-loader-circle",
      "menu": "i-lucide-menu",
      "minus": "i-lucide-minus",
      "panelClose": "i-lucide-panel-left-close",
      "panelOpen": "i-lucide-panel-left-open",
      "plus": "i-lucide-plus",
      "reload": "i-lucide-rotate-ccw",
      "search": "i-lucide-search",
      "stop": "i-lucide-square",
      "success": "i-lucide-circle-check",
      "system": "i-lucide-monitor",
      "tip": "i-lucide-lightbulb",
      "upload": "i-lucide-upload",
      "warning": "i-lucide-triangle-alert"
    }
  },
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "cssLayer": "components",
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "dashicons",
      "devicon",
      "devicon-plain",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fad",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "logos",
      "ls",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "pixelarticons",
      "prime",
      "ps",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "si-glyph",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "streamline",
      "streamline-emojis",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};

const appConfig = defuFn(appConfig0, inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(opts?.normalize ? p.toLowerCase() : p)).join("") : "";
}
function camelCase(str, opts) {
  return lowerFirst(pascalCase(str || "", opts));
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ?? "-") : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}
const titleCaseExceptions = /^(a|an|and|as|at|but|by|for|if|in|is|nor|of|on|or|the|to|with)$/i;
function titleCase(str, opts) {
  return (Array.isArray(str) ? str : splitByCase(str)).filter(Boolean).map(
    (p) => titleCaseExceptions.test(p) ? p.toLowerCase() : upperFirst(p)
  ).join(" ");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "b67d41df-2d66-403b-a575-e428bbeff679",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__sitemap__/style.xsl": {
        "headers": {
          "Content-Type": "application/xslt+xml"
        }
      },
      "/sitemap.xml": {
        "headers": {
          "Content-Type": "text/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=600, must-revalidate",
          "X-Sitemap-Prerendered": "2025-08-25T09:20:53.025Z"
        }
      },
      "/__link-checker__/*": {
        "headers": {
          "X-Robots-Tag": "noindex"
        }
      },
      "/__nuxt_content/**": {
        "robots": false
      },
      "/__nuxt_content/landing/sql_dump.txt": {
        "prerender": true
      },
      "/__nuxt_content/docs/sql_dump.txt": {
        "prerender": true
      },
      "/_nuxt": {
        "robots": "noindex",
        "headers": {
          "X-Robots-Tag": "noindex"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable",
          "X-Robots-Tag": "noindex"
        },
        "robots": "noindex"
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_fonts/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "url": "https://mhaibaraai.cn",
    "seo-utils": {
      "canonicalQueryWhitelist": [
        "page",
        "sort",
        "filter",
        "search",
        "q",
        "category",
        "tag"
      ],
      "canonicalLowercase": true
    },
    "content": {
      "wsUrl": ""
    },
    "mdc": {
      "components": {
        "prose": true,
        "map": {
          "accordion": "ProseAccordion",
          "accordion-item": "ProseAccordionItem",
          "badge": "ProseBadge",
          "callout": "ProseCallout",
          "card": "ProseCard",
          "card-group": "ProseCardGroup",
          "caution": "ProseCaution",
          "code-collapse": "ProseCodeCollapse",
          "code-group": "ProseCodeGroup",
          "code-icon": "ProseCodeIcon",
          "code-preview": "ProseCodePreview",
          "code-tree": "ProseCodeTree",
          "collapsible": "ProseCollapsible",
          "field": "ProseField",
          "field-group": "ProseFieldGroup",
          "icon": "ProseIcon",
          "kbd": "ProseKbd",
          "note": "ProseNote",
          "steps": "ProseSteps",
          "tabs": "ProseTabs",
          "tabs-item": "ProseTabsItem",
          "tip": "ProseTip",
          "warning": "ProseWarning"
        }
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    }
  },
  "sitemap": {
    "isI18nMapped": false,
    "sitemapName": "sitemap.xml",
    "isMultiSitemap": false,
    "excludeAppSources": [],
    "cacheMaxAgeSeconds": 600,
    "autoLastmod": false,
    "defaultSitemapsChunkSize": 1000,
    "minify": false,
    "sortEntries": true,
    "debug": false,
    "discoverImages": true,
    "discoverVideos": true,
    "sitemapsPathPrefix": "/__sitemap__/",
    "isNuxtContentDocumentDriven": false,
    "xsl": "/__sitemap__/style.xsl",
    "xslTips": true,
    "xslColumns": [
      {
        "label": "URL",
        "width": "50%"
      },
      {
        "label": "Images",
        "width": "25%",
        "select": "count(image:image)"
      },
      {
        "label": "Last Updated",
        "width": "25%",
        "select": "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"
      }
    ],
    "credits": true,
    "version": "7.4.3",
    "sitemaps": {
      "sitemap.xml": {
        "sitemapName": "sitemap.xml",
        "route": "sitemap.xml",
        "defaults": {},
        "include": [],
        "exclude": [
          "/_**",
          "/_nuxt/**",
          "/__nuxt_content/**"
        ],
        "includeAppSources": true
      }
    }
  },
  "nuxt-schema-org": {
    "reactive": false,
    "minify": true,
    "scriptAttributes": {
      "data-nuxt-schema-org": true
    },
    "identity": {
      "name": "YiXuan",
      "image": "/avatar.png",
      "url": "https://mhaibaraai.cn",
      "description": "一个专注于技术分享与知识沉淀的个人网站。",
      "email": "mhaibaraai@gmail.com",
      "sameAs": [
        "https://github.com/mhaibaraai"
      ],
      "_resolver": "person"
    },
    "version": "5.0.6"
  },
  "llms": {
    "domain": "https://mhaibaraai.cn",
    "title": "YiXuan 的开发随笔",
    "description": "一个专注于技术分享与知识沉淀的个人网站。",
    "notes": [
      "技术分享",
      "知识沉淀",
      "开发随笔"
    ],
    "sections": [
      {
        "title": "Documentation Sets",
        "links": [
          {
            "title": "YiXuan 的开发随笔",
            "description": "一个专注于技术分享与知识沉淀的个人网站。从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。",
            "href": "https://mhaibaraai.cn/llms-full.txt"
          }
        ]
      }
    ]
  },
  "icon": {
    "serverKnownCssClasses": []
  },
  "content": {
    "databaseVersion": "v3.5.0",
    "version": "3.6.3",
    "database": {
      "type": "sqlite",
      "filename": "./contents.sqlite"
    },
    "localDatabase": {
      "type": "sqlite",
      "filename": "/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/.data/content/contents.sqlite"
    },
    "integrityCheck": true
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "name": "mhaibaraai.cn",
        "env": "production"
      },
      {
        "_context": "package.json",
        "_priority": -10,
        "name": "mhaibaraai.cn",
        "description": "一个专注于技术分享与知识沉淀的个人网站。"
      },
      {
        "_priority": -3,
        "_context": "nuxt-site-config:config",
        "url": "https://mhaibaraai.cn",
        "name": "YiXuan 的开发随笔",
        "logo": "/avatar.png",
        "description": "一个专注于技术分享与知识沉淀的个人网站。",
        "defaultLocale": "zh-CN"
      }
    ],
    "version": "3.2.2",
    "debug": false,
    "multiTenancy": []
  },
  "nuxt-robots": {
    "version": "5.5.0",
    "isNuxtContentV2": false,
    "debug": false,
    "credits": true,
    "groups": [
      {
        "userAgent": [
          "*"
        ],
        "disallow": [
          "",
          "/__link-checker__"
        ],
        "allow": [],
        "contentUsage": [],
        "_indexable": true,
        "_rules": [
          {
            "pattern": "/__link-checker__",
            "allow": false
          }
        ]
      }
    ],
    "sitemap": [
      "https://mhaibaraai.cn/sitemap.xml",
      "/sitemap.xml"
    ],
    "header": true,
    "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    "robotsDisabledValue": "noindex, nofollow",
    "cacheControl": "max-age=14400, must-revalidate",
    "botDetection": true
  },
  "nuxt-og-image": {
    "version": "5.1.9",
    "satoriOptions": {},
    "resvgOptions": {},
    "sharpOptions": {},
    "publicStoragePath": "root:public",
    "defaults": {
      "emojis": "noto",
      "renderer": "satori",
      "component": "NuxtSeo",
      "extension": "png",
      "width": 1200,
      "height": 600,
      "cacheMaxAgeSeconds": 259200
    },
    "debug": false,
    "baseCacheKey": "/cache/nuxt-og-image/5.1.9",
    "fonts": [
      {
        "cacheKey": "Noto+Sans+SC:400",
        "style": "normal",
        "weight": "400",
        "name": "Noto+Sans+SC",
        "path": "",
        "key": "nuxt-og-image:fonts:Noto+Sans+SC-normal-400.ttf.base64"
      }
    ],
    "hasNuxtIcon": true,
    "colorPreference": "light",
    "strictNuxtContentPaths": "",
    "isNuxtContentDocumentDriven": false
  },
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": []
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = /* @__PURE__ */ new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2].split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    let idx;
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length > 0)
      idx = stack.push(entry);
    return () => {
      if (typeof idx !== "undefined") {
        stack.splice(idx - 1, 1);
      }
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

function envSiteConfig(env) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(/^NUXT_(PUBLIC_)?SITE_/, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0].toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

function useSiteConfig(e, _options) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

const _FH9HuNyLOLaEm9zhusY9yQnR769TWgPNm7J_vy7Oi7M = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    const isIsland = process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith("/__nuxt_island");
    event.path;
    const noSSR = event.context.nuxt?.noSSR || routeOptions.ssr === false && !isIsland || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(useSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

const KNOWN_SEARCH_BOTS = [
  {
    pattern: "googlebot",
    name: "googlebot",
    secondaryPatterns: ["google.com/bot.html"]
  },
  {
    pattern: "bingbot",
    name: "bingbot",
    secondaryPatterns: ["msnbot"]
  },
  {
    pattern: "yandexbot",
    name: "yandexbot"
  },
  {
    pattern: "baiduspider",
    name: "baiduspider",
    secondaryPatterns: ["baidu.com"]
  },
  {
    pattern: "duckduckbot",
    name: "duckduckbot",
    secondaryPatterns: ["duckduckgo.com"]
  },
  {
    pattern: "slurp",
    name: "yahoo"
  }
];
const SOCIAL_BOTS = [
  {
    pattern: "twitterbot",
    name: "twitter",
    secondaryPatterns: ["twitter"]
  },
  {
    pattern: "facebookexternalhit",
    name: "facebook",
    secondaryPatterns: ["facebook.com"]
  },
  {
    pattern: "linkedinbot",
    name: "linkedin",
    secondaryPatterns: ["linkedin"]
  },
  {
    pattern: "pinterestbot",
    name: "pinterest",
    secondaryPatterns: ["pinterest"]
  },
  {
    pattern: "discordbot",
    name: "discord",
    secondaryPatterns: ["discordapp"]
  }
];
const SEO_BOTS = [
  {
    pattern: "mj12bot",
    name: "majestic12",
    secondaryPatterns: ["majestic12.co.uk/bot"]
  },
  {
    pattern: "ahrefsbot",
    name: "ahrefs",
    secondaryPatterns: ["ahrefs.com"]
  },
  {
    pattern: "semrushbot",
    name: "semrush",
    secondaryPatterns: ["semrush.com/bot"]
  },
  {
    pattern: "screaming frog",
    name: "screaming-frog",
    secondaryPatterns: ["screamingfrog.co.uk"]
  },
  {
    pattern: "rogerbot",
    name: "moz"
  }
];
const AI_BOTS = [
  {
    pattern: "anthropic",
    name: "anthropic"
  },
  {
    pattern: "claude",
    name: "claude"
  },
  {
    pattern: "gptbot",
    name: "gpt",
    secondaryPatterns: ["openai.com"]
  },
  {
    pattern: "googlebot-news",
    name: "google-news"
  },
  {
    pattern: "cohere",
    name: "cohere",
    secondaryPatterns: ["cohere.com"]
  },
  {
    pattern: "ccbot",
    name: "commoncrawl",
    secondaryPatterns: ["commoncrawl.org"]
  },
  {
    pattern: "perplexitybot",
    name: "perplexity",
    secondaryPatterns: ["perplexity.ai"]
  }
];
const HTTP_TOOL_BOTS = [
  {
    pattern: "python-requests",
    name: "requests",
    secondaryPatterns: ["python"]
  },
  {
    pattern: "wget",
    name: "wget"
  },
  {
    pattern: "curl",
    name: "curl",
    secondaryPatterns: ["curl"]
  }
];
const SECURITY_SCANNING_BOTS = [
  {
    pattern: "zgrab",
    name: "zgrab"
  },
  {
    pattern: "masscan",
    name: "masscan"
  },
  {
    pattern: "nmap",
    name: "nmap",
    secondaryPatterns: ["insecure.org"]
  },
  {
    pattern: "nikto",
    name: "nikto"
  },
  {
    pattern: "wpscan",
    name: "wpscan"
  }
];
const SCRAPING_BOTS = [
  {
    pattern: "scrapy",
    name: "scrapy",
    secondaryPatterns: ["scrapy.org"]
  }
];
const AUTOMATION_BOTS = [
  {
    pattern: "phantomjs",
    name: "phantomjs"
  },
  {
    pattern: "headless",
    name: "headless-browser"
  },
  {
    pattern: "playwright",
    name: "playwright"
  },
  {
    pattern: "selenium",
    name: "selenium",
    secondaryPatterns: ["webdriver"]
  },
  {
    pattern: "puppeteer",
    name: "puppeteer",
    secondaryPatterns: ["headless"]
  }
];
const GENERIC_BOTS = [
  {
    pattern: "bot",
    name: "generic-bot"
  },
  {
    pattern: "spider",
    name: "generic-spider"
  },
  {
    pattern: "crawler",
    name: "generic-crawler"
  },
  {
    pattern: "scraper",
    name: "generic-scraper"
  }
];
const BOT_MAP = [
  {
    type: "search-engine",
    bots: KNOWN_SEARCH_BOTS,
    trusted: true
  },
  {
    type: "social",
    bots: SOCIAL_BOTS,
    trusted: true
  },
  {
    type: "seo",
    bots: SEO_BOTS,
    trusted: true
  },
  {
    type: "ai",
    bots: AI_BOTS,
    trusted: true
  },
  {
    type: "generic",
    bots: GENERIC_BOTS,
    trusted: false
  },
  {
    type: "automation",
    bots: AUTOMATION_BOTS,
    trusted: false
  },
  {
    type: "http-tool",
    bots: HTTP_TOOL_BOTS,
    trusted: false
  },
  {
    type: "security-scanner",
    bots: SECURITY_SCANNING_BOTS,
    trusted: false
  },
  {
    type: "scraping",
    bots: SCRAPING_BOTS,
    trusted: false
  }
];
function matches(pattern, path) {
  const pathLength = path.length;
  const patternLength = pattern.length;
  const matchingLengths = Array.from({ length: pathLength + 1 }).fill(0);
  let numMatchingLengths = 1;
  let p = 0;
  while (p < patternLength) {
    if (pattern[p] === "$" && p + 1 === patternLength) {
      return matchingLengths[numMatchingLengths - 1] === pathLength;
    }
    if (pattern[p] === "*") {
      numMatchingLengths = pathLength - matchingLengths[0] + 1;
      for (let i = 1; i < numMatchingLengths; i++) {
        matchingLengths[i] = matchingLengths[i - 1] + 1;
      }
    } else {
      let numMatches = 0;
      for (let i = 0; i < numMatchingLengths; i++) {
        const matchLength = matchingLengths[i];
        if (matchLength < pathLength && path[matchLength] === pattern[p]) {
          matchingLengths[numMatches++] = matchLength + 1;
        }
      }
      if (numMatches === 0) {
        return false;
      }
      numMatchingLengths = numMatches;
    }
    p++;
  }
  return true;
}
function matchPathToRule(path, _rules) {
  let matchedRule = null;
  const rules = _rules.filter(Boolean);
  const rulesLength = rules.length;
  let i = 0;
  while (i < rulesLength) {
    const rule = rules[i];
    if (!rule || !matches(rule.pattern, path)) {
      i++;
      continue;
    }
    if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
      matchedRule = rule;
    } else if (rule.pattern.length === matchedRule.pattern.length && rule.allow && !matchedRule.allow) {
      matchedRule = rule;
    }
    i++;
  }
  return matchedRule;
}
function asArray(v) {
  return typeof v === "undefined" ? [] : Array.isArray(v) ? v : [v];
}
function generateRobotsTxt({ groups, sitemaps }) {
  const lines = [];
  for (const group of groups) {
    for (const comment of group.comment || [])
      lines.push(`# ${comment}`);
    for (const userAgent of group.userAgent || ["*"])
      lines.push(`User-agent: ${userAgent}`);
    for (const allow of group.allow || [])
      lines.push(`Allow: ${allow}`);
    for (const disallow of group.disallow || [])
      lines.push(`Disallow: ${disallow}`);
    for (const cleanParam of group.cleanParam || [])
      lines.push(`Clean-param: ${cleanParam}`);
    for (const contentUsage of group.contentUsage || [])
      lines.push(`Content-Usage: ${contentUsage}`);
    lines.push("");
  }
  for (const sitemap of sitemaps)
    lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n");
}
function createPatternMap() {
  const patternMap = /* @__PURE__ */ new Map();
  for (const def of BOT_MAP) {
    for (const bot of def.bots) {
      const patterns = [bot.pattern, ...bot.secondaryPatterns || []];
      for (const pattern of patterns) {
        patternMap.set(pattern.toLowerCase(), {
          botName: bot.name,
          botCategory: def.type,
          trusted: def.trusted
        });
      }
    }
  }
  return patternMap;
}

function useRuntimeConfigNuxtRobots(event) {
  return useRuntimeConfig(event)["nuxt-robots"];
}

const logger$2 = createConsola({
  defaults: { tag: "@nuxtjs/robots" }
});

async function resolveRobotsTxtContext(e, nitro = useNitroApp()) {
  const { groups, sitemap: sitemaps } = useRuntimeConfigNuxtRobots(e);
  const generateRobotsTxtCtx = {
    event: e,
    context: e ? "robots.txt" : "init",
    ...JSON.parse(JSON.stringify({ groups, sitemaps }))
  };
  await nitro.hooks.callHook("robots:config", generateRobotsTxtCtx);
  nitro._robots.ctx = generateRobotsTxtCtx;
  return generateRobotsTxtCtx;
}

const _79YxO9rYOh_cumysILeIKUNeZcy4Jd_H8UY8mCT83_U = defineNitroPlugin(async (nitroApp) => {
  const { isNuxtContentV2, robotsDisabledValue, botDetection } = useRuntimeConfigNuxtRobots();
  if (botDetection !== false) {
    nitroApp._robotsPatternMap = createPatternMap();
  }
  nitroApp._robots = {};
  await resolveRobotsTxtContext(void 0, nitroApp);
  const nuxtContentUrls = /* @__PURE__ */ new Set();
  if (isNuxtContentV2) {
    let urls;
    try {
      urls = await (await nitroApp.localFetch("/__robots__/nuxt-content.json", {})).json();
    } catch (e) {
      logger$2.error("Failed to read robot rules from content files.", e);
    }
    if (urls && Array.isArray(urls) && urls.length) {
      urls.forEach((url) => nuxtContentUrls.add(withoutTrailingSlash(url)));
    }
  }
  if (nuxtContentUrls.size) {
    nitroApp._robots.nuxtContentUrls = nuxtContentUrls;
  }
});

const DRIVER_NAME = "lru-cache";
const lruCacheDriver = defineDriver((opts = {}) => {
  const cache = new LRUCache({
    max: 1e3,
    sizeCalculation: opts.maxSize || opts.maxEntrySize ? (value, key) => {
      return key.length + byteLength(value);
    } : void 0,
    ...opts
  });
  return {
    name: DRIVER_NAME,
    options: opts,
    getInstance: () => cache,
    hasItem(key) {
      return cache.has(key);
    },
    getItem(key) {
      return cache.get(key) ?? null;
    },
    getItemRaw(key) {
      return cache.get(key) ?? null;
    },
    setItem(key, value) {
      cache.set(key, value);
    },
    setItemRaw(key, value) {
      cache.set(key, value);
    },
    removeItem(key) {
      cache.delete(key);
    },
    getKeys() {
      return [...cache.keys()];
    },
    clear() {
      cache.clear();
    },
    dispose() {
      cache.clear();
    }
  };
});
function byteLength(value) {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.byteLength(value);
    } catch {
    }
  }
  try {
    return typeof value === "string" ? value.length : JSON.stringify(value).length;
  } catch {
  }
  return 0;
}

const htmlPayloadCache = createStorage({
  // short cache time so we don't need many entries at runtime
  driver: lruCacheDriver({ max: 50 })
});
const fontCache = createStorage({
  driver: lruCacheDriver({ max: 10 })
});
const emojiCache = createStorage({
  driver: lruCacheDriver({ max: 1e3 })
});

function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0];
  return ext && fileExtensions.includes(ext.replace(".", ""));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

function useNitroOrigin(e) {
  process.env.NITRO_SSL_CERT;
  process.env.NITRO_SSL_KEY;
  let host = process.env.NITRO_HOST || process.env.HOST || false;
  let port = false;
  let protocol = "https" ;
  if (e) {
    host = getRequestHost(e, { xForwardedHost: true }) || host;
    protocol = getRequestProtocol(e, { xForwardedProto: true }) || protocol;
  }
  if (typeof host === "string" && host.includes(":")) {
    port = host.split(":").pop();
    host = host.split(":")[0];
  }
  port = port ? `:${port}` : "";
  return withTrailingSlash(`${protocol}://${host}${port}`);
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = useSiteConfig(e);
  const nitroOrigin = useNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}
function withSiteUrl(e, path, options = {}) {
  const siteConfig = e.context.siteConfig?.get();
  let siteUrl = e.context.siteConfigNitroOrigin;
  if ((options.canonical !== false || false) && siteConfig.url)
    siteUrl = siteConfig.url;
  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase
  });
}

function detectBase64MimeType(data) {
  const signatures = {
    "R0lGODdh": "image/gif",
    "R0lGODlh": "image/gif",
    "iVBORw0KGgo": "image/png",
    "/9j/": "image/jpeg",
    "UklGR": "image/webp",
    "AAABAA": "image/x-icon"
  };
  for (const s in signatures) {
    if (data.startsWith(s)) {
      return signatures[s];
    }
  }
  return "image/svg+xml";
}
function toBase64Image(data) {
  const base64 = typeof data === "string" ? data : Buffer.from(data).toString("base64");
  const type = detectBase64MimeType(base64);
  return `data:${type};base64,${base64}`;
}
function filterIsOgImageOption(key) {
  const keys = [
    "url",
    "extension",
    "width",
    "height",
    "fonts",
    "alt",
    "props",
    "renderer",
    "html",
    "component",
    "renderer",
    "emojis",
    "_query",
    "satori",
    "resvg",
    "sharp",
    "screenshot",
    "cacheMaxAgeSeconds"
  ];
  return keys.includes(key);
}
function separateProps(options, ignoreKeys = []) {
  options = options || {};
  const _props = defu(options.props, Object.fromEntries(
    Object.entries({ ...options }).filter(([k]) => !filterIsOgImageOption(k) && !ignoreKeys.includes(k))
  ));
  const props = {};
  Object.entries(_props).forEach(([key, val]) => {
    props[key.replace(/-([a-z])/g, (g) => String(g[1]).toUpperCase())] = val;
  });
  return {
    ...Object.fromEntries(
      Object.entries({ ...options }).filter(([k]) => filterIsOgImageOption(k) || ignoreKeys.includes(k))
    ),
    props
  };
}
function normaliseFontInput(fonts) {
  return fonts.map((f) => {
    if (typeof f === "string") {
      const vals = f.split(":");
      const includesStyle = vals.length === 3;
      let name, weight, style;
      if (includesStyle) {
        name = vals[0];
        style = vals[1];
        weight = vals[2];
      } else {
        name = vals[0];
        weight = vals[1];
      }
      return {
        cacheKey: f,
        name,
        weight: weight || 400,
        style: style || "normal",
        path: void 0
      };
    }
    return {
      cacheKey: f.key || `${f.name}:${f.style}:${f.weight}`,
      style: "normal",
      weight: 400,
      ...f
    };
  });
}

const theme = {};

function htmlDecodeQuotes(html) {
  return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}
function decodeHtml(html) {
  return html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&cent;/g, "\xA2").replace(/&pound;/g, "\xA3").replace(/&yen;/g, "\xA5").replace(/&euro;/g, "\u20AC").replace(/&copy;/g, "\xA9").replace(/&reg;/g, "\xAE").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/&#(\d+);/g, (full, int) => {
    return String.fromCharCode(Number.parseInt(int));
  }).replace(/&amp;/g, "&");
}
function decodeObjectHtmlEntities(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "string")
      obj[key] = decodeHtml(value);
  });
  return obj;
}

function fetchIsland(e, component, props) {
  const hashId = hash$1([component, props]).replaceAll("_", "-");
  return e.$fetch(`/__nuxt_island/${component}_${hashId}.json`, {
    params: {
      props: JSON.stringify(props)
    }
  });
}
function withoutQuery$2(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher$2() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(withoutTrailingSlash(withoutQuery$2(path)), app.baseURL)
    ).reverse());
  };
}

const logger$1 = createConsola({
  defaults: {
    tag: "Nuxt OG Image"
  }
});

const componentNames = [{"hash":"VWrRyohD2a9Blej8cZkzaenOASAi1snFkXbymRhMatk","pascalName":"OgImageDocs","kebabName":"og-image-docs","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/app/components/og-image/Docs.vue","category":"app"},{"hash":"SOHaoKfoo4fUkREsCFGw8ewxkl4-XkkHkug2VwYRtFM","pascalName":"BrandedLogo","kebabName":"branded-logo","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/BrandedLogo.vue","category":"community"},{"hash":"tFoYPh0fXaZR3uXybAqFEOGnQuQsvz-E-Yq-CtrFlIY","pascalName":"Frame","kebabName":"frame","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Frame.vue","category":"community"},{"hash":"NPQTTXYQ8toXx5OaJ1VlRUUcxy1SNOxg-FoM7C08ZPM","pascalName":"Nuxt","kebabName":"nuxt","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Nuxt.vue","category":"community"},{"hash":"VAHSTZlVcPHzkozocV1iTnwc4-YttdoOkHsYfoSgDZ4","pascalName":"NuxtSeo","kebabName":"nuxt-seo","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/NuxtSeo.vue","category":"community"},{"hash":"8CNn4yU043gQFqO-sZNDPz9GKED-h7ahXJ-61c9ThHM","pascalName":"Pergel","kebabName":"pergel","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Pergel.vue","category":"community"},{"hash":"b-Juo-FXQepo6SOCnA478MTAqbXNZuve6-MzHgTKA7s","pascalName":"SimpleBlog","kebabName":"simple-blog","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/SimpleBlog.vue","category":"community"},{"hash":"vRUm5ru-64PEHIGsBby6-vCgLBg7iUJfvFKL6VuCXtI","pascalName":"UnJs","kebabName":"un-js","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/UnJs.vue","category":"community"},{"hash":"hq07GBU-Yd16ICfETt8SfSxfaYj3qBmDAiQkTcv89nw","pascalName":"Wave","kebabName":"wave","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Wave.vue","category":"community"},{"hash":"zSwOodBXcjwS1qvFqGBJqitTEEnrvVfwQYkTeIxNpws","pascalName":"WithEmoji","kebabName":"with-emoji","path":"/home/runner/work/mhaibaraai.cn/mhaibaraai.cn/node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/WithEmoji.vue","category":"community"}];

function normaliseOptions(_options) {
  const options = { ..._options };
  if (!options)
    return options;
  if (options.component && componentNames) {
    const originalName = options.component;
    for (const component of componentNames) {
      if (component.pascalName.endsWith(originalName) || component.kebabName.endsWith(originalName)) {
        options.component = component.pascalName;
        break;
      }
    }
  } else if (!options.component) {
    options.component = componentNames[0]?.pascalName;
  }
  return options;
}

function useOgImageRuntimeConfig(e) {
  const c = useRuntimeConfig(e);
  return {
    ...c["nuxt-og-image"],
    app: {
      baseURL: c.app.baseURL
    }
  };
}

const satoriRendererInstance = { instance: void 0 };
const chromiumRendererInstance = { instance: void 0 };
async function useSatoriRenderer() {
  satoriRendererInstance.instance = satoriRendererInstance.instance || await import('../_/renderer.mjs').then((m) => m.default);
  return satoriRendererInstance.instance;
}
async function useChromiumRenderer() {
  chromiumRendererInstance.instance = chromiumRendererInstance.instance || await import('../_/empty.mjs').then((m) => m.default);
  return chromiumRendererInstance.instance;
}

function resolvePathCacheKey(e, path) {
  const siteConfig = useSiteConfig(e, {
    resolveRefs: true
  });
  const basePath = withoutTrailingSlash(withoutLeadingSlash(normalizeKey$1(path)));
  return [
    !basePath || basePath === "/" ? "index" : basePath,
    hash$1([
      basePath,
      siteConfig.url,
      hash$1(getQuery(e))
    ])
  ].join(":");
}
async function resolveContext(e) {
  const runtimeConfig = useOgImageRuntimeConfig();
  const resolvePathWithBase = createSitePathResolver(e, {
    absolute: false,
    withBase: true
  });
  const path = resolvePathWithBase(parseURL(e.path).pathname);
  const extension = path.split(".").pop();
  if (!extension) {
    return createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Missing OG Image type.`
    });
  }
  if (!["png", "jpeg", "jpg", "svg", "html", "json"].includes(extension)) {
    return createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Unknown OG Image type ${extension}.`
    });
  }
  const query = getQuery(e);
  let queryParams = {};
  for (const k in query) {
    const v = String(query[k]);
    if (!v)
      continue;
    if (v.startsWith("{")) {
      try {
        queryParams[k] = JSON.parse(v);
      } catch (error) {
      }
    } else {
      queryParams[k] = v;
    }
  }
  queryParams = separateProps(queryParams);
  let basePath = withoutTrailingSlash(
    path.replace(`/__og-image__/image`, "").replace(`/__og-image__/static`, "").replace(`/og.${extension}`, "")
  );
  if (queryParams._query && typeof queryParams._query === "object")
    basePath = withQuery(basePath, queryParams._query);
  const isDebugJsonPayload = extension === "json" && runtimeConfig.debug;
  const key = resolvePathCacheKey(e, basePath);
  let options = queryParams.options;
  if (!options) {
    if (!options) {
      const payload = await fetchPathHtmlAndExtractOptions(e, basePath, key);
      if (payload instanceof Error)
        return payload;
      options = payload;
    }
  }
  delete queryParams.options;
  const routeRuleMatcher = createNitroRouteRuleMatcher$2();
  const routeRules = routeRuleMatcher(basePath);
  if (typeof routeRules.ogImage === "undefined" && !options) {
    return createError$1({
      statusCode: 400,
      statusMessage: "The route is missing the Nuxt OG Image payload or route rules."
    });
  }
  const ogImageRouteRules = separateProps(routeRules.ogImage);
  options = defu(queryParams, options, ogImageRouteRules, runtimeConfig.defaults);
  if (!options) {
    return createError$1({
      statusCode: 404,
      statusMessage: "[Nuxt OG Image] OG Image not found."
    });
  }
  let renderer;
  switch (options.renderer) {
    case "satori":
      renderer = await useSatoriRenderer();
      break;
    case "chromium":
      renderer = await useChromiumRenderer();
      break;
  }
  if (!renderer || renderer.__mock__) {
    throw createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Renderer ${options.renderer} is not enabled.`
    });
  }
  const unocss = await createGenerator({ theme }, {
    presets: [
      presetWind()
    ]
  });
  const ctx = {
    unocss,
    e,
    key,
    renderer,
    isDebugJsonPayload,
    runtimeConfig,
    publicStoragePath: runtimeConfig.publicStoragePath,
    extension,
    basePath,
    options: normaliseOptions(options),
    _nitro: useNitroApp()
  };
  await ctx._nitro.hooks.callHook("nuxt-og-image:context", ctx);
  return ctx;
}
const PAYLOAD_REGEX = /<script.+id="nuxt-og-image-options"[^>]*>(.+?)<\/script>/;
function getPayloadFromHtml(html) {
  const match = String(html).match(PAYLOAD_REGEX);
  return match ? String(match[1]) : null;
}
function extractAndNormaliseOgImageOptions(html) {
  const _payload = getPayloadFromHtml(html);
  let options = false;
  try {
    const payload2 = parse(_payload || "{}");
    Object.entries(payload2).forEach(([key, value]) => {
      if (!value && value !== 0)
        delete payload2[key];
    });
    options = payload2;
  } catch (e) {
  }
  if (options && typeof options?.props?.description === "undefined") {
    const description = html.match(/<meta[^>]+name="description"[^>]*>/)?.[0];
    if (description) {
      const [, content] = description.match(/content="([^"]+)"/) || [];
      if (content && !options.props.description)
        options.props.description = content;
    }
  }
  const payload = decodeObjectHtmlEntities(options || {});
  return payload;
}
async function doFetchWithErrorHandling(fetch, path) {
  const res = await fetch(path, {
    redirect: "follow",
    headers: {
      accept: "text/html"
    }
  }).catch((err) => {
    return err;
  });
  let errorDescription;
  if (res.status >= 300 && res.status < 400) {
    if (res.headers.has("location")) {
      return await doFetchWithErrorHandling(fetch, res.headers.get("location") || "");
    }
    errorDescription = `${res.status} redirected to ${res.headers.get("location") || "unknown"}`;
  } else if (res.status >= 500) {
    errorDescription = `${res.status} error: ${res.statusText}`;
  }
  if (errorDescription) {
    return [null, createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] Failed to parse \`${path}\` for og-image extraction. ${errorDescription}`
    })];
  }
  if (res._data) {
    return [res._data, null];
  } else if (res.text) {
    return [await res.text(), null];
  }
  return ["", null];
}
async function fetchPathHtmlAndExtractOptions(e, path, key) {
  const cachedHtmlPayload = await htmlPayloadCache.getItem(key);
  if (cachedHtmlPayload && cachedHtmlPayload.expiresAt < Date.now())
    return cachedHtmlPayload.value;
  let _payload = null;
  let [html, err] = await doFetchWithErrorHandling(e.fetch, path);
  if (err) {
    logger$1.warn(err);
  } else {
    _payload = getPayloadFromHtml(html);
  }
  if (!_payload) {
    const [fallbackHtml, err2] = await doFetchWithErrorHandling(globalThis.$fetch.raw, path);
    if (err2) {
      return err2;
    }
    _payload = getPayloadFromHtml(fallbackHtml);
    if (_payload) {
      html = fallbackHtml;
    }
  }
  if (!html) {
    return createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] Failed to read the path ${path} for og-image extraction, returning no HTML.`
    });
  }
  if (!_payload) {
    const payload2 = extractAndNormaliseOgImageOptions(html);
    if (payload2 && typeof payload2 === "object" && payload2.socialPreview?.og?.image) {
      const image = payload2.socialPreview.og.image;
      const p = {
        custom: true,
        url: typeof image === "string" ? image : image
      };
      if (typeof image === "object" && image["image:width"]) {
        p.width = image["image:width"];
      }
      if (typeof image === "object" && image["image:height"]) {
        p.height = image["image:height"];
      }
      return p;
    }
    return createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] HTML response from ${path} is missing the #nuxt-og-image-options script tag. Make sure you have defined an og image for this page.`
    });
  }
  const payload = extractAndNormaliseOgImageOptions(html);
  if (payload) {
    await htmlPayloadCache.setItem(key, {
      // 60 minutes for prerender, 10 seconds for runtime
      expiresAt: Date.now() + 1e3 * (10),
      value: payload
    });
  }
  return typeof payload === "object" ? payload : createError$1({
    statusCode: 500,
    statusMessage: "[Nuxt OG Image] Invalid payload type."
  });
}

const _rgUrIMXzuK3Vd_TXFs4r2SS5aCKF5QzS5N65TqrPt54 = defineNitroPlugin(async (nitro) => {
  return;
});

const checksums = {
  "landing": "v3.5.0--MBuofgs8HahlkPRIzCY171oF-djjwyiLinxTqYoGRdQ",
  "docs": "v3.5.0--TTtAELtFEezCzXI9gPXy9HfRtHoVaNOai2PHr1nEABk"
};
const checksumsStructure = {
  "landing": "6eTLJOOD_auXElNEmCpiVgUF7iwnAi0ZnMw2nEzga9s",
  "docs": "aF--7-D7ppjW3kdTT8EAAwbJF0GFt_Oe-5dUuPwieeY"
};

const tables = {
  "landing": "_content_landing",
  "docs": "_content_docs",
  "info": "_content_info"
};

const contentManifest = {
  "landing": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "head": "json",
      "hero": "json",
      "meta": "json",
      "navigation": "json",
      "ogImage": "json",
      "path": "string",
      "schemaOrg": "json",
      "section": "json",
      "seo": "json",
      "sitemap": "json",
      "stem": "string"
    }
  },
  "docs": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "head": "json",
      "links": "json",
      "meta": "json",
      "navigation": "json",
      "ogImage": "json",
      "path": "string",
      "schemaOrg": "json",
      "seo": "json",
      "sitemap": "json",
      "stem": "string"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
};

const linkProps = ["href", "src", "to"];
const importExternalPackage = async (name) => await import(name);
async function createDocumentGenerator() {
  const visit = await importExternalPackage("unist-util-visit").then((res) => res.visit);
  const stringifyMarkdown = await importExternalPackage("@nuxtjs/mdc/runtime").then((res) => res.stringifyMarkdown);
  return generateDocument;
  async function generateDocument(doc, options) {
    const hastTree = refineDocumentBody(doc.body, options);
    let markdown = await stringifyMarkdown(hastTree, {});
    if (!markdown?.trim().startsWith("# ")) {
      const title = doc.title || doc.seo?.title || "";
      if (title) {
        markdown = `# ${title}

${markdown}`;
      }
    }
    return markdown;
  }
  function refineDocumentBody(body, options) {
    const hastTree = toHast(body);
    visit(hastTree, (node) => !!node.props?.to || !!node.props?.href || !!node.props?.src, (node) => {
      for (const prop of linkProps) {
        if (node.props?.[prop]) {
          node.props[prop] = withBase(node.props[prop], options.domain);
        }
      }
    });
    return hastTree;
  }
}
function prepareContentSections(sections) {
  const contentSections = sections.filter((section) => section.contentCollection);
  if (contentSections.length) {
    return;
  }
  const pageCollecitons = Object.keys(contentManifest).filter((c) => contentManifest[c].type === "page");
  const autoGeneratedSections = pageCollecitons.map((c) => ({
    __nuxt_content_auto_generate: true,
    title: pascalCase(c),
    contentCollection: c,
    contentFilters: [
      {
        field: "extension",
        operator: "=",
        value: "md"
      }
    ]
  }));
  sections.push(...autoGeneratedSections);
}

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
  return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const llmsHooks = createHooks();
llmsHooks.beforeEach(() => {
  const hooks = Object.values(llmsHooks._hooks || {});
  const hasRegisteredHook = hooks.some((hooksList) => Array.isArray(hooksList) && hooksList.length > 0);
  if (hasRegisteredHook) {
    console.warn("[nuxt-llms] `llmsHooks` are deprecated and will be removed in future versions. Use `useNitroApp().hooks.hook('llms:generate', (event, options) => {})` instead");
  }
});

const buildGroup = (group, type) => {
  const conditions = group._conditions;
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : "";
};
const collectionQueryGroup = (collection) => {
  const conditions = [];
  const query = {
    // @ts-expect-error -- internal
    _conditions: conditions,
    where(field, operator, value) {
      let condition;
      switch (operator.toUpperCase()) {
        case "IN":
        case "NOT IN":
          if (Array.isArray(value)) {
            const values = value.map((val) => singleQuote(val)).join(", ");
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`;
          } else {
            throw new TypeError(`Value for ${operator} must be an array`);
          }
          break;
        case "BETWEEN":
        case "NOT BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value[0])} AND ${singleQuote(value[1])}`;
          } else {
            throw new Error(`Value for ${operator} must be an array with two elements`);
          }
          break;
        case "IS NULL":
        case "IS NOT NULL":
          condition = `"${String(field)}" ${operator.toUpperCase()}`;
          break;
        case "LIKE":
        case "NOT LIKE":
          condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value)}`;
          break;
        default:
          condition = `"${String(field)}" ${operator} ${singleQuote(typeof value === "boolean" ? Number(value) : value)}`;
      }
      conditions.push(`${condition}`);
      return query;
    },
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "OR"));
      return query;
    }
  };
  return query;
};
const collectionQueryBuilder = (collection, fetch) => {
  const params = {
    conditions: [],
    selectedFields: [],
    offset: 0,
    limit: 0,
    orderBy: [],
    // Count query
    count: {
      field: "",
      distinct: false
    }
  };
  const query = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "OR"));
      return query;
    },
    path(path) {
      return query.where("path", "=", withoutTrailingSlash(path));
    },
    skip(skip) {
      params.offset = skip;
      return query;
    },
    where(field, operator, value) {
      query.andWhere((group) => group.where(String(field), operator, value));
      return query;
    },
    limit(limit) {
      params.limit = limit;
      return query;
    },
    select(...fields) {
      if (fields.length) {
        params.selectedFields.push(...fields);
      }
      return query;
    },
    order(field, direction) {
      params.orderBy.push(`"${String(field)}" ${direction}`);
      return query;
    },
    async all() {
      return fetch(collection, buildQuery()).then((res) => res || []);
    },
    async first() {
      return fetch(collection, buildQuery({ limit: 1 })).then((res) => res[0] || null);
    },
    async count(field = "*", distinct = false) {
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct }
      })).then((m) => m[0].count);
    }
  };
  function buildQuery(opts = {}) {
    let query2 = "SELECT ";
    if (opts?.count) {
      query2 += `COUNT(${opts.count.distinct ? "DISTINCT " : ""}${opts.count.field}) as count`;
    } else {
      const fields = Array.from(new Set(params.selectedFields));
      query2 += fields.length > 0 ? fields.map((f) => `"${String(f)}"`).join(", ") : "*";
    }
    query2 += ` FROM ${tables[String(collection)]}`;
    if (params.conditions.length > 0) {
      query2 += ` WHERE ${params.conditions.join(" AND ")}`;
    }
    if (params.orderBy.length > 0) {
      query2 += ` ORDER BY ${params.orderBy.join(", ")}`;
    } else {
      query2 += ` ORDER BY stem ASC`;
    }
    const limit = opts?.limit || params.limit;
    if (limit > 0) {
      if (params.offset > 0) {
        query2 += ` LIMIT ${limit} OFFSET ${params.offset}`;
      } else {
        query2 += ` LIMIT ${limit}`;
      }
    }
    return query2;
  }
  return query;
};
function singleQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function fetchDatabase(event, collection) {
  return await $fetch(`/__nuxt_content/${collection}/sql_dump.txt`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    responseType: "text",
    headers: {
      "content-type": "text/plain",
      ...event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 }
  });
}
async function fetchQuery(event, collection, sql) {
  return await $fetch(`/__nuxt_content/${collection}/query`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      "content-type": "application/json",
      ...event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 },
    method: "POST",
    body: {
      sql
    }
  });
}

const queryCollection = (event, collection) => {
  return collectionQueryBuilder(collection, (collection2, sql) => fetchQuery(event, collection2, sql));
};

function getSiteIndexable(e) {
  const { env, indexable } = useSiteConfig(e);
  if (typeof indexable !== "undefined")
    return String(indexable) === "true";
  return env === "production";
}

const ROBOT_DIRECTIVE_VALUES = {
  // Standard directives
  enabled: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  disabled: "noindex, nofollow",
  index: "index",
  noindex: "noindex",
  follow: "follow",
  nofollow: "nofollow",
  none: "none",
  all: "all",
  // Non-standard directives (not part of official robots spec)
  noai: "noai",
  noimageai: "noimageai"
};
function formatMaxImagePreview(value) {
  return `max-image-preview:${value}`;
}
function formatMaxSnippet(value) {
  return `max-snippet:${value}`;
}
function formatMaxVideoPreview(value) {
  return `max-video-preview:${value}`;
}

function withoutQuery$1(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher$1(e) {
  const { nitro, app } = useRuntimeConfig(e);
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(withoutTrailingSlash(withoutQuery$1(path)), app.baseURL)
    ).reverse());
  };
}

function normaliseRobotsRouteRule(config) {
  let allow;
  if (typeof config.robots === "boolean")
    allow = config.robots;
  else if (typeof config.robots === "object" && "indexable" in config.robots && typeof config.robots.indexable !== "undefined")
    allow = config.robots.indexable;
  let rule;
  if (typeof config.robots === "object" && config.robots !== null) {
    if ("rule" in config.robots && typeof config.robots.rule !== "undefined") {
      rule = config.robots.rule;
    } else if (!("indexable" in config.robots)) {
      const directives = [];
      for (const [key, value] of Object.entries(config.robots)) {
        if (value === false || value === null || value === void 0)
          continue;
        if (key in ROBOT_DIRECTIVE_VALUES && typeof value === "boolean" && value) {
          directives.push(ROBOT_DIRECTIVE_VALUES[key]);
        } else if (key === "max-image-preview" && typeof value === "string") {
          directives.push(formatMaxImagePreview(value));
        } else if (key === "max-snippet" && typeof value === "number") {
          directives.push(formatMaxSnippet(value));
        } else if (key === "max-video-preview" && typeof value === "number") {
          directives.push(formatMaxVideoPreview(value));
        }
      }
      if (directives.length > 0) {
        rule = directives.join(", ");
      }
    }
  } else if (typeof config.robots === "string") {
    rule = config.robots;
  }
  if (rule && typeof allow === "undefined") {
    const disallowIndicators = ["none", "noindex", "noai", "noimageai"];
    allow = !disallowIndicators.some(
      (indicator) => rule === indicator || rule.split(",").some((part) => part.trim() === indicator)
    );
  }
  if (typeof allow === "undefined" && typeof rule === "undefined")
    return;
  return {
    allow,
    rule
  };
}

function getSiteRobotConfig(e) {
  const query = getQuery(e);
  const hints = [];
  const { groups, debug } = useRuntimeConfigNuxtRobots(e);
  let indexable = getSiteIndexable(e);
  const queryIndexableEnabled = String(query.mockProductionEnv) === "true" || query.mockProductionEnv === "";
  if (debug || false) {
    const { _context } = useSiteConfig(e, { debug: debug || false });
    if (queryIndexableEnabled) {
      indexable = true;
      hints.push("You are mocking a production enviroment with ?mockProductionEnv query.");
    } else if (!indexable && _context.indexable === "nuxt-robots:config") {
      hints.push("You are blocking indexing with your Nuxt Robots config.");
    } else if (!queryIndexableEnabled && !_context.indexable) {
      hints.push(`Indexing is blocked in development. You can mock a production environment with ?mockProductionEnv query.`);
    } else if (!indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is blocked by site config set by ${_context.indexable}.`);
    } else if (indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is enabled from ${_context.indexable}.`);
    }
  }
  if (groups.some((g) => g.userAgent.includes("*") && g.disallow.includes("/"))) {
    indexable = false;
    hints.push("You are blocking all user agents with a wildcard `Disallow /`.");
  } else if (groups.some((g) => g.disallow.includes("/"))) {
    hints.push("You are blocking specific user agents with `Disallow /`.");
  }
  return { indexable, hints };
}

function getPathRobotConfig(e, options) {
  const runtimeConfig = useRuntimeConfig(e);
  const { robotsDisabledValue, robotsEnabledValue, isNuxtContentV2 } = useRuntimeConfigNuxtRobots(e);
  if (!options?.skipSiteIndexable) {
    if (!getSiteRobotConfig(e).indexable) {
      return {
        rule: robotsDisabledValue,
        indexable: false,
        debug: {
          source: "Site Config"
        }
      };
    }
  }
  const path = options?.path || e.path;
  let userAgent = options?.userAgent;
  if (!userAgent) {
    try {
      userAgent = getRequestHeader(e, "User-Agent");
    } catch {
    }
  }
  const nitroApp = useNitroApp();
  const groups = [
    // run explicit user agent matching first
    ...nitroApp._robots.ctx.groups.filter((g) => {
      if (userAgent) {
        return g.userAgent.some((ua) => ua.toLowerCase().includes(userAgent.toLowerCase()));
      }
      return false;
    }),
    // run wildcard matches second
    ...nitroApp._robots.ctx.groups.filter((g) => g.userAgent.includes("*"))
  ];
  for (const group of groups) {
    if (!group._indexable) {
      return {
        indexable: false,
        rule: robotsDisabledValue,
        debug: {
          source: "/robots.txt",
          line: `Disallow: /`
        }
      };
    }
    const robotsTxtRule = matchPathToRule(path, group._rules || []);
    if (robotsTxtRule) {
      if (!robotsTxtRule.allow) {
        return {
          indexable: false,
          rule: robotsDisabledValue,
          debug: {
            source: "/robots.txt",
            line: `Disallow: ${robotsTxtRule.pattern}`
          }
        };
      }
      break;
    }
  }
  if (isNuxtContentV2 && nitroApp._robots?.nuxtContentUrls?.has(withoutTrailingSlash(path))) {
    return {
      indexable: false,
      rule: robotsDisabledValue,
      debug: {
        source: "Nuxt Content"
      }
    };
  }
  nitroApp._robotsRuleMatcher = nitroApp._robotsRuleMatcher || createNitroRouteRuleMatcher$1(e);
  let routeRulesPath = path;
  if (runtimeConfig.public?.i18n?.locales) {
    const { locales } = runtimeConfig.public.i18n;
    const locale = locales.find((l) => routeRulesPath.startsWith(`/${l.code}`));
    if (locale) {
      routeRulesPath = routeRulesPath.replace(`/${locale.code}`, "");
    }
  }
  const routeRules = normaliseRobotsRouteRule(nitroApp._robotsRuleMatcher(routeRulesPath));
  if (routeRules && (typeof routeRules.allow !== "undefined" || typeof routeRules.rule !== "undefined")) {
    return {
      indexable: routeRules.allow ?? false,
      rule: routeRules.rule || (routeRules.allow ? robotsEnabledValue : robotsDisabledValue),
      debug: {
        source: "Route Rules"
      }
    };
  }
  return {
    indexable: true,
    rule: robotsEnabledValue
  };
}

const _75a8NhSTWuItK1Z9XimnkCc6bTzUzSsdB9SWngbL23w = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("llms:generate", async (event, options) => {
    prepareContentSections(options.sections);
    const sectionsToRemove = [];
    for (const index in options.sections) {
      const section = options.sections[index];
      if (!section.contentCollection) {
        continue;
      }
      const query = queryCollection(event, section.contentCollection).select("path", "title", "seo", "description").where("path", "NOT LIKE", "%/.navigation");
      const filters = section.contentFilters || [];
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value);
      }
      const docs = await query.all();
      if (docs.length === 0 && section.__nuxt_content_auto_generate) {
        sectionsToRemove.push(index);
        continue;
      }
      section.links ||= [];
      section.links.push(...docs.map((doc) => {
        return {
          title: doc.title || doc?.seo?.title || "",
          description: doc.description || doc?.seo?.description || "",
          href: withBase(doc.path, options.domain)
        };
      }));
    }
    sectionsToRemove.reverse().forEach((index) => {
      options.sections.splice(Number(index), 1);
    });
  });
  nitroApp.hooks.hook("llms:generate:full", async (event, options, contents) => {
    prepareContentSections(options.sections);
    const generateDocument = await createDocumentGenerator();
    for (const index in options.sections) {
      const section = options.sections[index];
      if (!section.contentCollection) {
        continue;
      }
      const query = queryCollection(event, section.contentCollection).where("path", "NOT LIKE", "%/.navigation");
      const filters = section.contentFilters || [];
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value);
      }
      const docs = await query.all();
      for (const doc of docs) {
        await nitroApp.hooks.callHook("content:llms:generate:document", event, doc, options);
        const markdown = await generateDocument(doc, options);
        contents.push(markdown);
      }
    }
  });
});

const script = "\"use strict\";(()=>{const t=window,e=document.documentElement,c=[\"dark\",\"light\"],n=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let i=n===\"system\"?u():n;const r=e.getAttribute(\"data-color-mode-forced\");r&&(i=r),l(i),t[\"__NUXT_COLOR_MODE__\"]={preference:n,value:i,getColorScheme:u,addColorScheme:l,removeColorScheme:d};function l(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.add(s):e.className+=\" \"+s,a&&e.setAttribute(\"data-\"+a,o)}function d(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.remove(s):e.className=e.className.replace(new RegExp(s,\"g\"),\"\"),a&&e.removeAttribute(\"data-\"+a)}function f(o){return t.matchMedia(\"(prefers-color-scheme\"+o+\")\")}function u(){if(t.matchMedia&&f(\"\").media!==\"not all\"){for(const o of c)if(f(\":\"+o).matches)return o}return\"light\"}})();function getStorageValue(t,e){switch(t){case\"localStorage\":return window.localStorage.getItem(e);case\"sessionStorage\":return window.sessionStorage.getItem(e);case\"cookie\":return getCookie(e);default:return null}}function getCookie(t){const c=(\"; \"+window.document.cookie).split(\"; \"+t+\"=\");if(c.length===2)return c.pop()?.split(\";\").shift()}";

const _4ERM5ddlMfttT6yYpXUygv3ks6HvafprFaaoGmblzc = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const _YvdDyYX0YdIlUHLXQxZCx_084JQAbmpT2My_pM8MILE = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("llms:generate", (_, { sections }) => {
    sections.forEach((section) => {
      if (section.links) {
        section.links = section.links.map((link) => ({
          ...link,
          href: `${link.href.replace(/^https:\/\/mhaibaraai.cn/, "https://mhaibaraai.cn/raw")}.md`
        }));
      }
    });
  });
});

const plugins = [
  _FH9HuNyLOLaEm9zhusY9yQnR769TWgPNm7J_vy7Oi7M,
_79YxO9rYOh_cumysILeIKUNeZcy4Jd_H8UY8mCT83_U,
_rgUrIMXzuK3Vd_TXFs4r2SS5aCKF5QzS5N65TqrPt54,
_75a8NhSTWuItK1Z9XimnkCc6bTzUzSsdB9SWngbL23w,
_4ERM5ddlMfttT6yYpXUygv3ks6HvafprFaaoGmblzc,
_YvdDyYX0YdIlUHLXQxZCx_084JQAbmpT2My_pM8MILE
];

const assets = {
  "/404.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"e18-hd6oHyl/6KP4qBXBrgeTBJCd/4M\"",
    "mtime": "2025-08-25T09:21:49.543Z",
    "size": 3608,
    "path": "../public/404.html"
  },
  "/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2ccd-JRNavlosu0CEmexlg01yVUJY8h4\"",
    "mtime": "2025-08-25T09:21:50.787Z",
    "size": 11469,
    "path": "../public/_payload.json"
  },
  "/avatar.png": {
    "type": "image/png",
    "etag": "\"2cfd2-pF8zW5tTDkjeoP6mRFdSpY+YEU4\"",
    "mtime": "2025-08-25T09:22:47.883Z",
    "size": 184274,
    "path": "../public/avatar.png"
  },
  "/ecosystem.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"14a1c-Lv48yiWaiM10uT5/UThtkjeh8m4\"",
    "mtime": "2025-08-25T09:21:50.862Z",
    "size": 84508,
    "path": "../public/ecosystem.html"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"3c2e-hU9agIsM5yZy224s5XKdkSX9s5c\"",
    "mtime": "2025-08-25T09:22:47.883Z",
    "size": 15406,
    "path": "../public/favicon.ico"
  },
  "/guides.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"f71b-P+3Lkr5e7onMV8z4jxXN5KV6qgM\"",
    "mtime": "2025-08-25T09:21:50.840Z",
    "size": 63259,
    "path": "../public/guides.html"
  },
  "/i-llustration.png": {
    "type": "image/png",
    "etag": "\"cb06-cX5q8Xxh/nV2Dlk503S2NoP9D1M\"",
    "mtime": "2025-08-25T09:22:47.883Z",
    "size": 51974,
    "path": "../public/i-llustration.png"
  },
  "/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1107b-qmzWPrfkGOF0O6Q/ccG3lzTgfb4\"",
    "mtime": "2025-08-25T09:21:50.227Z",
    "size": 69755,
    "path": "../public/index.html"
  },
  "/llms-full.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1ecda-1Bm7FViplggS95Pl1fe3uuF9dHU\"",
    "mtime": "2025-08-25T09:21:49.172Z",
    "size": 126170,
    "path": "../public/llms-full.txt"
  },
  "/llms.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"12a0-b4b/7rQZrr243hHTPC9faaAeQog\"",
    "mtime": "2025-08-25T09:21:48.663Z",
    "size": 4768,
    "path": "../public/llms.txt"
  },
  "/logo.svg": {
    "type": "image/svg+xml",
    "etag": "\"a20-dRPGLBRqUYD3gx6KDAk2RvbP1qI\"",
    "mtime": "2025-08-25T09:22:47.883Z",
    "size": 2592,
    "path": "../public/logo.svg"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"92-BS2P3EHOyYCTwX0R2vzRGVEQ/Us\"",
    "mtime": "2025-08-25T09:21:48.660Z",
    "size": 146,
    "path": "../public/robots.txt"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": "\"2d2c-zRD54b0i9HAgEdUMV7DAABUPRAg\"",
    "mtime": "2025-08-25T09:22:47.047Z",
    "size": 11564,
    "path": "../public/sitemap.xml"
  },
  "/tools.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"e28e-nnnbPo7nA5OOK37G0F9QNlzqgsU\"",
    "mtime": "2025-08-25T09:21:50.834Z",
    "size": 57998,
    "path": "../public/tools.html"
  },
  "/__link-checker__/link-checker-report.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"b2c9e-XrsB3Fv7wcM5hhIVo/OPxAcACrk\"",
    "mtime": "2025-08-25T09:22:47.683Z",
    "size": 732318,
    "path": "../public/__link-checker__/link-checker-report.html"
  },
  "/__link-checker__/link-checker-report.json": {
    "type": "application/json",
    "etag": "\"d84d6-/gG9kZctzAXIk5KeEyd25LQ1UKQ\"",
    "mtime": "2025-08-25T09:22:47.692Z",
    "size": 885974,
    "path": "../public/__link-checker__/link-checker-report.json"
  },
  "/__link-checker__/link-checker-report.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"2f762-/tlx2BSvBe1N8jgNzJrs3QnBJfA\"",
    "mtime": "2025-08-25T09:22:47.687Z",
    "size": 194402,
    "path": "../public/__link-checker__/link-checker-report.md"
  },
  "/__sitemap__/style.xsl": {
    "type": "application/xslt+xml",
    "etag": "\"175e-8XaGwW3qu6UUCatGMeTRYm0aWWE\"",
    "mtime": "2025-08-25T09:21:48.659Z",
    "size": 5982,
    "path": "../public/__sitemap__/style.xsl"
  },
  "/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-1qeyFf9_6vK64CcMwgwTffI_9nnExS_Zoj3QiHtMXlQ.woff2": {
    "type": "font/woff2",
    "etag": "\"4b5c-TAo9mx7r3xQs52+HbHcHJ52z8Qo\"",
    "mtime": "2025-08-25T09:22:47.824Z",
    "size": 19292,
    "path": "../public/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-1qeyFf9_6vK64CcMwgwTffI_9nnExS_Zoj3QiHtMXlQ.woff2"
  },
  "/_fonts/5IArdN4L5jOjmIgNWjXwBf8z7LwCc01XijCBmkK5aGg-dWGhVeJEbV_5K65nKmkoLcWqMMzWxlhJp_as2rgeRdM.woff": {
    "type": "font/woff",
    "etag": "\"78e4-hwSbalN7FANcCgKeeNIp8i3KouY\"",
    "mtime": "2025-08-25T09:22:47.824Z",
    "size": 30948,
    "path": "../public/_fonts/5IArdN4L5jOjmIgNWjXwBf8z7LwCc01XijCBmkK5aGg-dWGhVeJEbV_5K65nKmkoLcWqMMzWxlhJp_as2rgeRdM.woff"
  },
  "/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-ePpgXqBAcVHzWyOmLmoO36pXD6naURrRSnBWcSNRywI.woff2": {
    "type": "font/woff2",
    "etag": "\"212c-FshXJibFzNhd2HEIMP8C3JR5PYg\"",
    "mtime": "2025-08-25T09:22:47.824Z",
    "size": 8492,
    "path": "../public/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-ePpgXqBAcVHzWyOmLmoO36pXD6naURrRSnBWcSNRywI.woff2"
  },
  "/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-nKEn1QNlfsui4nebfAs6DwSkQmkF3kXXjQ7vbPq3H0E.woff2": {
    "type": "font/woff2",
    "etag": "\"680c-mJtsV33lkTAKSmfq5k3lKHSllcU\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 26636,
    "path": "../public/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-nKEn1QNlfsui4nebfAs6DwSkQmkF3kXXjQ7vbPq3H0E.woff2"
  },
  "/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-AEQEsr04R27wxrozTeBZaJGVCSw1AMR3d7fniO5STHI.woff2": {
    "type": "font/woff2",
    "etag": "\"6ec4-8OoFFPZKF1grqmfGVjh5JDE6DOU\"",
    "mtime": "2025-08-25T09:22:47.824Z",
    "size": 28356,
    "path": "../public/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-AEQEsr04R27wxrozTeBZaJGVCSw1AMR3d7fniO5STHI.woff2"
  },
  "/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-XfRDGaSeLY6SPnWpjad4l8ioAqB5UAqAaECLhmLVqN0.woff2": {
    "type": "font/woff2",
    "etag": "\"1d98-cDZfMibtk4T04FTTAmlfhWDpkN0\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 7576,
    "path": "../public/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-XfRDGaSeLY6SPnWpjad4l8ioAqB5UAqAaECLhmLVqN0.woff2"
  },
  "/_fonts/RQuM9oqyBZLVckg_2j5DZNYP0zZ0UdWH9opo6dHz0Wk-g3nOTumM728RmGmGiGW_garuaNQO_vmSnSfAnwBuBig.woff": {
    "type": "font/woff",
    "etag": "\"78f4-WIESQuTe5tvATtx1OpZlzEhXsnM\"",
    "mtime": "2025-08-25T09:22:47.824Z",
    "size": 30964,
    "path": "../public/_fonts/RQuM9oqyBZLVckg_2j5DZNYP0zZ0UdWH9opo6dHz0Wk-g3nOTumM728RmGmGiGW_garuaNQO_vmSnSfAnwBuBig.woff"
  },
  "/_fonts/VcMivr0bexw4wuCgM3KfT7ufOn0MBVSf4fAOnaSKcMQ-_74-0Wt-g0kLuUvg-VFET0BwvxA4oZaVwPHcQzXT8jQ.woff": {
    "type": "font/woff",
    "etag": "\"78f4-SHspM+AgGNPRVoxz3JqHAAA1q30\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 30964,
    "path": "../public/_fonts/VcMivr0bexw4wuCgM3KfT7ufOn0MBVSf4fAOnaSKcMQ-_74-0Wt-g0kLuUvg-VFET0BwvxA4oZaVwPHcQzXT8jQ.woff"
  },
  "/_fonts/WKdez1KObFVfdr7oOpoKChRTZVr81IQ5Yh5Tx_wTTgU-9SgjnSKuuIVeqrjkfzw4GVJA4CPyIALd5Q75i5tlmag.woff": {
    "type": "font/woff",
    "etag": "\"7190-5O42T9VPiuHiq8aHh4eCubNjZsE\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 29072,
    "path": "../public/_fonts/WKdez1KObFVfdr7oOpoKChRTZVr81IQ5Yh5Tx_wTTgU-9SgjnSKuuIVeqrjkfzw4GVJA4CPyIALd5Q75i5tlmag.woff"
  },
  "/_fonts/e90plyNTcceYpTLq3bZUaIlfflt4DWwTWUHgjPCDhf8-GCyl8gQkvaZtyNI51wUr9faEXHHh_O4Z4_7CoKOaLJ4.woff": {
    "type": "font/woff",
    "etag": "\"71d0-sbWwZNV/dpvwcbh7Ojc9bi6bu04\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 29136,
    "path": "../public/_fonts/e90plyNTcceYpTLq3bZUaIlfflt4DWwTWUHgjPCDhf8-GCyl8gQkvaZtyNI51wUr9faEXHHh_O4Z4_7CoKOaLJ4.woff"
  },
  "/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-gon7SQLUjyaiRzGiXFQQ08HvkYxlCZMdUnVlbkX2eAQ.woff2": {
    "type": "font/woff2",
    "etag": "\"47c4-5xyngHnzzhetUee74tMx9OTgqNQ\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 18372,
    "path": "../public/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-gon7SQLUjyaiRzGiXFQQ08HvkYxlCZMdUnVlbkX2eAQ.woff2"
  },
  "/_fonts/opbEuhz7QJaU60tjeKh5bPMoIYCRWmeCOfvEnbPyAAs-l_gzDk2tj_2fLvTvsox3Q3PIGmqZ4T-QJe3xGXUIqPU.woff": {
    "type": "font/woff",
    "etag": "\"7194-pPJhv5RUyzAofiwwVp1INyNE8dw\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 29076,
    "path": "../public/_fonts/opbEuhz7QJaU60tjeKh5bPMoIYCRWmeCOfvEnbPyAAs-l_gzDk2tj_2fLvTvsox3Q3PIGmqZ4T-QJe3xGXUIqPU.woff"
  },
  "/_fonts/sBwYw97nBwL-OG9iwx4YflkEdv2ZnhNhTTg0UmbyXds-MVxFV1NwHuHQ_5iR2pAWV2WgC9SkqDeHiwEsvV5c1YQ.woff": {
    "type": "font/woff",
    "etag": "\"7164-qLecHDMMuuwc1Qmhiv3ApCv+gVY\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 29028,
    "path": "../public/_fonts/sBwYw97nBwL-OG9iwx4YflkEdv2ZnhNhTTg0UmbyXds-MVxFV1NwHuHQ_5iR2pAWV2WgC9SkqDeHiwEsvV5c1YQ.woff"
  },
  "/_fonts/tlKtuelNQfWcU80gS10yE7hN_jWKDQWZ-qirYMB2HTU-i7NQtVBHh8n650Y952KKAPEKCEh4IaeC5LGBLegZcPE.woff": {
    "type": "font/woff",
    "etag": "\"79d8-Jhl89A8PZCBFrpRNu1FsNbdJ7MU\"",
    "mtime": "2025-08-25T09:22:47.825Z",
    "size": 31192,
    "path": "../public/_fonts/tlKtuelNQfWcU80gS10yE7hN_jWKDQWZ-qirYMB2HTU-i7NQtVBHh8n650Y952KKAPEKCEh4IaeC5LGBLegZcPE.woff"
  },
  "/ecosystem/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2889-EYETB+ynyVcqY8+TxVc7lYbQ63c\"",
    "mtime": "2025-08-25T09:22:01.725Z",
    "size": 10377,
    "path": "../public/ecosystem/_payload.json"
  },
  "/ecosystem/java.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1308e-klVmeVz97C88LURoRvtvG2DMEFA\"",
    "mtime": "2025-08-25T09:22:12.159Z",
    "size": 77966,
    "path": "../public/ecosystem/java.html"
  },
  "/ecosystem/javascript.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"12fa9-JHMMvWDByKoJDtTJnks1kiyc/ww\"",
    "mtime": "2025-08-25T09:22:10.740Z",
    "size": 77737,
    "path": "../public/ecosystem/javascript.html"
  },
  "/ecosystem/nuxt.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"13afd-101Qdu62iO707FkRBiWiZlPFpa4\"",
    "mtime": "2025-08-25T09:22:14.841Z",
    "size": 80637,
    "path": "../public/ecosystem/nuxt.html"
  },
  "/ecosystem/styles.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"12f69-1LXbZLBmrFF69DiNNvGwHZT5nI4\"",
    "mtime": "2025-08-25T09:22:11.767Z",
    "size": 77673,
    "path": "../public/ecosystem/styles.html"
  },
  "/ecosystem/typescript.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"12c21-LOX2J3544T9pYlO3RtXQ2zk6iSU\"",
    "mtime": "2025-08-25T09:22:12.142Z",
    "size": 76833,
    "path": "../public/ecosystem/typescript.html"
  },
  "/ecosystem/ui-libraries.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"12bed-KJ72cbSniUjkVwtOkbSgfvXNFhY\"",
    "mtime": "2025-08-25T09:22:14.883Z",
    "size": 76781,
    "path": "../public/ecosystem/ui-libraries.html"
  },
  "/ecosystem/vite.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1304b-JZgCHyRf3Eu5Sb9zcmbdtCNelvQ\"",
    "mtime": "2025-08-25T09:22:14.085Z",
    "size": 77899,
    "path": "../public/ecosystem/vite.html"
  },
  "/ecosystem/vue.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"12bcf-ixi4FekfBBlDrGOkBxXnk3Xylc4\"",
    "mtime": "2025-08-25T09:22:13.759Z",
    "size": 76751,
    "path": "../public/ecosystem/vue.html"
  },
  "/_nuxt/08yWwaDe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"490-6Yl1WZqoiSq0C6RrTFDEBXqpotU\"",
    "mtime": "2025-08-25T09:22:47.850Z",
    "size": 1168,
    "path": "../public/_nuxt/08yWwaDe.js"
  },
  "/_nuxt/2XoEmcM2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"202-cYo/hoQiyhU/pPVm9SupQvpQW+E\"",
    "mtime": "2025-08-25T09:22:47.850Z",
    "size": 514,
    "path": "../public/_nuxt/2XoEmcM2.js"
  },
  "/_nuxt/AFcqI_lZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"118a-CLaqV0b5+wkQCBG7dAMxbuwu/FE\"",
    "mtime": "2025-08-25T09:22:47.850Z",
    "size": 4490,
    "path": "../public/_nuxt/AFcqI_lZ.js"
  },
  "/_nuxt/B2iBBadI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-N/strc3US7T8RPMSFZ1IuyiA5xM\"",
    "mtime": "2025-08-25T09:22:47.850Z",
    "size": 497,
    "path": "../public/_nuxt/B2iBBadI.js"
  },
  "/_nuxt/B3g7SBaY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"151-mgW3pGHE1tbHNwYgQQFNkmdzpns\"",
    "mtime": "2025-08-25T09:22:47.850Z",
    "size": 337,
    "path": "../public/_nuxt/B3g7SBaY.js"
  },
  "/_nuxt/BAohTqrq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16a-OysbqxiGVtFP2d0RAq2gk5OkKxc\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 362,
    "path": "../public/_nuxt/BAohTqrq.js"
  },
  "/_nuxt/BFoJ2YrY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"135c-eOTjbrDfFIvkexlskK9tr5X9FCM\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 4956,
    "path": "../public/_nuxt/BFoJ2YrY.js"
  },
  "/_nuxt/BHOpT_yy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eb-wxpCNtYFp6WJ4uOW9Ks6B74hYMo\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 491,
    "path": "../public/_nuxt/BHOpT_yy.js"
  },
  "/_nuxt/BHSUewxW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"685-9Dy2DDMWN6Vi3sLJINKa0fhTtqA\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 1669,
    "path": "../public/_nuxt/BHSUewxW.js"
  },
  "/_nuxt/BKhVP08q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a8984-Ak1tqgHzvSI76mcCaXwXccZ8eMQ\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 690564,
    "path": "../public/_nuxt/BKhVP08q.js"
  },
  "/_nuxt/BN_7HF1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"441-ZV8sW3gOP/trsjwfLG+C3bIiqms\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 1089,
    "path": "../public/_nuxt/BN_7HF1G.js"
  },
  "/_nuxt/BQUtkIn3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca-P/4miKSNmjmu/3zXDE15Oa7loNw\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 202,
    "path": "../public/_nuxt/BQUtkIn3.js"
  },
  "/_nuxt/BWmjB1nZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"164-/hhe8tNDDpFFMb7snBLoKNiUwFE\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 356,
    "path": "../public/_nuxt/BWmjB1nZ.js"
  },
  "/_nuxt/Bk0vUvtK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"327-sl8aK/TN71jMdWw/PQayYsaZ2B8\"",
    "mtime": "2025-08-25T09:22:47.851Z",
    "size": 807,
    "path": "../public/_nuxt/Bk0vUvtK.js"
  },
  "/_nuxt/BnTASCLY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30c55-z3pMq6Uz3JfayixDLTRhKue6O/g\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 199765,
    "path": "../public/_nuxt/BnTASCLY.js"
  },
  "/_nuxt/BnomaBVW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1231-M7MFZQLKb4oes3873SzloBgBFLg\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 4657,
    "path": "../public/_nuxt/BnomaBVW.js"
  },
  "/_nuxt/BrcZ2YwM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbb-TNpyFEmzTjZF/UzcuqsFY0TGkEg\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 3259,
    "path": "../public/_nuxt/BrcZ2YwM.js"
  },
  "/_nuxt/BslptAqj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"184-vHndUJbf+0msWspsFmkA0sgMbdU\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 388,
    "path": "../public/_nuxt/BslptAqj.js"
  },
  "/_nuxt/BuPbyEyf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"363-+B7tSJ0PIbMAFSJ75I0+cyOUL8k\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 867,
    "path": "../public/_nuxt/BuPbyEyf.js"
  },
  "/_nuxt/BzqJ4uCW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2379-vKbWkGJvKmWyOiYE8GL5OoNCA1U\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 9081,
    "path": "../public/_nuxt/BzqJ4uCW.js"
  },
  "/_nuxt/C3yycjSL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-0+Qua5d5tjYNjX3LMIRp2dlfIQo\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 497,
    "path": "../public/_nuxt/C3yycjSL.js"
  },
  "/_nuxt/C6Fa7m0u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18e-DjPBZvlpmBwk9GnBe5MX2vumjNk\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 398,
    "path": "../public/_nuxt/C6Fa7m0u.js"
  },
  "/_nuxt/C6lhc7XO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"669-us6+r9ZDh1T4tLtTZBkpulBFFTc\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 1641,
    "path": "../public/_nuxt/C6lhc7XO.js"
  },
  "/_nuxt/C8EFqAGO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ba-QsfZjV6WZVFi5ZpJrmoT9d3YVxI\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 186,
    "path": "../public/_nuxt/C8EFqAGO.js"
  },
  "/_nuxt/CCY0uIqy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"196-l80hEds8FU7dz4hcP9EAmNc5aXk\"",
    "mtime": "2025-08-25T09:22:47.852Z",
    "size": 406,
    "path": "../public/_nuxt/CCY0uIqy.js"
  },
  "/_nuxt/CJNrXfp2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b3-7qrtlo+fF2NJRGfcd0mamNDM+zo\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 435,
    "path": "../public/_nuxt/CJNrXfp2.js"
  },
  "/_nuxt/CP2JIWc8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"176-WN34AvbU3GA/WGkcmWM8Vg6/l0M\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 374,
    "path": "../public/_nuxt/CP2JIWc8.js"
  },
  "/_nuxt/CQ11_ofr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"daf8-OES1VNMjC1TcuQmF5OnKe9SHif8\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 56056,
    "path": "../public/_nuxt/CQ11_ofr.js"
  },
  "/_nuxt/CX0hvgTe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"206-0ZH5V6Blzx0cjwNKh+uInqrOP54\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 518,
    "path": "../public/_nuxt/CX0hvgTe.js"
  },
  "/_nuxt/ChQb6t7P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16a-cElq8foT7REv/eHWbAA42uUZKGE\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 362,
    "path": "../public/_nuxt/ChQb6t7P.js"
  },
  "/_nuxt/CkqmNUG3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9446-vTPdSd8ovsN5roP08uTPYTMw88Y\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 37958,
    "path": "../public/_nuxt/CkqmNUG3.js"
  },
  "/_nuxt/CnL2LckI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5bf-i9xSKCYaSW+ir3YAWiMpV6ehdbU\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 1471,
    "path": "../public/_nuxt/CnL2LckI.js"
  },
  "/_nuxt/CtQfWz_i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9c5-Xcsnhsaq4X08kP68pbSTlWDyL2Y\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 2501,
    "path": "../public/_nuxt/CtQfWz_i.js"
  },
  "/_nuxt/CwR8gNBe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dc-KioheOc6YoM4/C0IyWNIMAwQ1mw\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 476,
    "path": "../public/_nuxt/CwR8gNBe.js"
  },
  "/_nuxt/Cz_NKjLE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ed7c-2L9FzrQbcOBsFG03+ro3NmQAobQ\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 126332,
    "path": "../public/_nuxt/Cz_NKjLE.js"
  },
  "/_nuxt/D5koEuWW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"193-MNgRUK5ZmoFMpjWueV3y+CNh1e4\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 403,
    "path": "../public/_nuxt/D5koEuWW.js"
  },
  "/_nuxt/DDY38TIK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"191-fMYjSOIoFhAnHUcc9DnPJWPIEfk\"",
    "mtime": "2025-08-25T09:22:47.853Z",
    "size": 401,
    "path": "../public/_nuxt/DDY38TIK.js"
  },
  "/_nuxt/DFWcKoL4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"210-UuKhgpvTacmcN8VwOw0ucEOzStw\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 528,
    "path": "../public/_nuxt/DFWcKoL4.js"
  },
  "/_nuxt/DH4Y9uYb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e72-W7BpG5+B/HNHJngD4jHcddSj/Qw\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 11890,
    "path": "../public/_nuxt/DH4Y9uYb.js"
  },
  "/_nuxt/DI62Iytg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22a-HTcLXs9G7n4HbSFVMzuhSDLbFhc\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 554,
    "path": "../public/_nuxt/DI62Iytg.js"
  },
  "/_nuxt/DIQu6Y7N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15c-Otioxh4MrrD48iAkBQZLcIxYb20\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 348,
    "path": "../public/_nuxt/DIQu6Y7N.js"
  },
  "/_nuxt/DJWgs7IL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"76d-BspuVVwyu53JfemVYmNUfTTva9s\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 1901,
    "path": "../public/_nuxt/DJWgs7IL.js"
  },
  "/_nuxt/DPq88Vnh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15a-Nf7Yv1qUyJLZKYMbR0hILsHk21A\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 346,
    "path": "../public/_nuxt/DPq88Vnh.js"
  },
  "/_nuxt/DnBXmxdN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"155-W5+ZcR6s7wWKxtAqXF4NFx6K38I\"",
    "mtime": "2025-08-25T09:22:47.854Z",
    "size": 341,
    "path": "../public/_nuxt/DnBXmxdN.js"
  },
  "/_nuxt/DntxKsSY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163-mxp5ycIO4RzY47ga2a9P45pEeeI\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 355,
    "path": "../public/_nuxt/DntxKsSY.js"
  },
  "/_nuxt/DpN0Xaji.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"171-OVJxL7PBnPhUwT1jqJdNoU9/cRM\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 369,
    "path": "../public/_nuxt/DpN0Xaji.js"
  },
  "/_nuxt/Dptt4q9Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1208a-Z3UV8lTABLK9rMTMeCGIAdbIQiA\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 73866,
    "path": "../public/_nuxt/Dptt4q9Q.js"
  },
  "/_nuxt/DqvzQaeM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5bf-uPFUg3EtdFXScEPl8FPZfk/X90I\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 1471,
    "path": "../public/_nuxt/DqvzQaeM.js"
  },
  "/_nuxt/Drktdz-d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cc8-2qNAYl990hWsjOHf+FEksZ5nV9M\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 3272,
    "path": "../public/_nuxt/Drktdz-d.js"
  },
  "/_nuxt/Ds4VjJtL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"164-gs+2cSsmhQH84U6lJidCIlrQakw\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 356,
    "path": "../public/_nuxt/Ds4VjJtL.js"
  },
  "/_nuxt/DuRHnc9F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"78c-fO2BYv3SCp74Y+5fSkZvLzY3Re0\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 1932,
    "path": "../public/_nuxt/DuRHnc9F.js"
  },
  "/_nuxt/DvWhzpbP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16c-IWl0iPvXYtSIWGBqDNr6iD58+tw\"",
    "mtime": "2025-08-25T09:22:47.855Z",
    "size": 364,
    "path": "../public/_nuxt/DvWhzpbP.js"
  },
  "/_nuxt/DzrhgbC8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d1-+m/Spg9Olzs9eWE2s5AwhBc1DfU\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 721,
    "path": "../public/_nuxt/DzrhgbC8.js"
  },
  "/_nuxt/Dzvdm8Dj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1363-pZqUGR1poogFYeBUowQ6nOiUiKM\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 4963,
    "path": "../public/_nuxt/Dzvdm8Dj.js"
  },
  "/_nuxt/JdSbWy-4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b42-w6xDHPHDlixv02kHIKGx1bAUmUY\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 2882,
    "path": "../public/_nuxt/JdSbWy-4.js"
  },
  "/_nuxt/KdT7_F8K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33f-DfNhc7zvAeAlSeQepheyPj5zzWY\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 831,
    "path": "../public/_nuxt/KdT7_F8K.js"
  },
  "/_nuxt/M69pA9IW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f2-+w/h3Y6DU5yfwy0Adqadl2Ifkak\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 498,
    "path": "../public/_nuxt/M69pA9IW.js"
  },
  "/_nuxt/Pre.C8JBZdCo.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"154-3X2dcVATNhSrxNsy5d0Noekpt34\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 340,
    "path": "../public/_nuxt/Pre.C8JBZdCo.css"
  },
  "/_nuxt/_M6UPh1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"685-n8EaWE01WTtrGMUFe1FMDHGGY+A\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 1669,
    "path": "../public/_nuxt/_M6UPh1G.js"
  },
  "/_nuxt/_aZ1bFGp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"227-ynyesfK7eePAFZjjjUzDMY0JwvQ\"",
    "mtime": "2025-08-25T09:22:47.856Z",
    "size": 551,
    "path": "../public/_nuxt/_aZ1bFGp.js"
  },
  "/_nuxt/eDNE1ECG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7d3-r898x3ARRWfqmOHemxvKQOn9tY8\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 2003,
    "path": "../public/_nuxt/eDNE1ECG.js"
  },
  "/_nuxt/entry.ZhHIY_mj.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"31b22-4YV7YGcFtz+9mU+p49DL2HugAtg\"",
    "mtime": "2025-08-25T09:22:47.858Z",
    "size": 203554,
    "path": "../public/_nuxt/entry.ZhHIY_mj.css"
  },
  "/_nuxt/i6Di4OFn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d2-GiWYPabrgpfZikgCMkyoxlzGRzg\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 978,
    "path": "../public/_nuxt/i6Di4OFn.js"
  },
  "/_nuxt/p3ON2T-m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f6-MK2s9HClPub/uriSwgBFSHThhfs\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 502,
    "path": "../public/_nuxt/p3ON2T-m.js"
  },
  "/_nuxt/sQcYe89M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a56-5Uj8efplYkhvKiL8nwKI1sRJnNU\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 2646,
    "path": "../public/_nuxt/sQcYe89M.js"
  },
  "/_nuxt/sqlite3-Ubkxdgq9.wasm": {
    "type": "application/wasm",
    "etag": "\"d0fdc-5aKaKmmJfcV2FnoKyrujK7QY7n8\"",
    "mtime": "2025-08-25T09:22:47.858Z",
    "size": 856028,
    "path": "../public/_nuxt/sqlite3-Ubkxdgq9.wasm"
  },
  "/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24eb-/FBLK7guMdffqRNvJNbJgk4Zwss\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 9451,
    "path": "../public/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js"
  },
  "/_nuxt/sqlite3-worker1-bundler-friendly-CtVng1jz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30103-BpAdfbsXS8iy9nzg8F+bM4HznD4\"",
    "mtime": "2025-08-25T09:22:47.857Z",
    "size": 196867,
    "path": "../public/_nuxt/sqlite3-worker1-bundler-friendly-CtVng1jz.js"
  },
  "/_nuxt/sqlite3.Ubkxdgq9.wasm": {
    "type": "application/wasm",
    "etag": "\"d0fdc-5aKaKmmJfcV2FnoKyrujK7QY7n8\"",
    "mtime": "2025-08-25T09:22:47.858Z",
    "size": 856028,
    "path": "../public/_nuxt/sqlite3.Ubkxdgq9.wasm"
  },
  "/guides/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2883-zC1dbzOz79qIYvvQM6UT6GWSMHc\"",
    "mtime": "2025-08-25T09:21:59.358Z",
    "size": 10371,
    "path": "../public/guides/_payload.json"
  },
  "/guides/deployment.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"f199-XYU0sENoHR+yHmOvj+v3xH5k/XY\"",
    "mtime": "2025-08-25T09:22:05.470Z",
    "size": 61849,
    "path": "../public/guides/deployment.html"
  },
  "/guides/os.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"ed57-SKa3ywcEdzt27FNwAgRBc5Egmyc\"",
    "mtime": "2025-08-25T09:22:06.017Z",
    "size": 60759,
    "path": "../public/guides/os.html"
  },
  "/guides/platforms.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"f1f4-DY577oozJBW4nukrbYSJ+nJlSCw\"",
    "mtime": "2025-08-25T09:22:07.978Z",
    "size": 61940,
    "path": "../public/guides/platforms.html"
  },
  "/guides/runtime.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"eaa5-1NMnTSj4vmpaFX6C/1xf18McfpY\"",
    "mtime": "2025-08-25T09:22:07.986Z",
    "size": 60069,
    "path": "../public/guides/runtime.html"
  },
  "/tools/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2881-yMmvcVxSWQi9ZOHrJ7jwGGmX4kc\"",
    "mtime": "2025-08-25T09:21:58.380Z",
    "size": 10369,
    "path": "../public/tools/_payload.json"
  },
  "/tools/editors.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"e0bd-94Qw+yMxR/3KK8NPIOhUqPtxuFU\"",
    "mtime": "2025-08-25T09:22:04.236Z",
    "size": 57533,
    "path": "../public/tools/editors.html"
  },
  "/tools/package-managers.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"ddc9-GXEtapFBbeLlL4QVj41og0/fD2U\"",
    "mtime": "2025-08-25T09:22:02.234Z",
    "size": 56777,
    "path": "../public/tools/package-managers.html"
  },
  "/tools/version-control.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"dde7-ZdnGiJYJFgiw2nCEhHSCoWnbngE\"",
    "mtime": "2025-08-25T09:22:02.619Z",
    "size": 56807,
    "path": "../public/tools/version-control.html"
  },
  "/__nuxt_content/docs/sql_dump.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"2229c-wSVi2pu1KsNwT/96bJPp22JzfTw\"",
    "mtime": "2025-08-25T09:21:48.664Z",
    "size": 139932,
    "path": "../public/__nuxt_content/docs/sql_dump.txt"
  },
  "/__nuxt_content/landing/sql_dump.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"608-lT9dAFznhqUoWyqxda0TIyfVKoM\"",
    "mtime": "2025-08-25T09:21:48.664Z",
    "size": 1544,
    "path": "../public/__nuxt_content/landing/sql_dump.txt"
  },
  "/__og-image__/static/og.png": {
    "type": "image/png",
    "etag": "\"5145f-zn4PULHVPYwLqqxrLqkblVZI5Vs\"",
    "mtime": "2025-08-25T09:21:58.154Z",
    "size": 332895,
    "path": "../public/__og-image__/static/og.png"
  },
  "/_ipx/s_32x32/avatar.png": {
    "type": "image/jpeg",
    "etag": "\"313-T8fjjBWsSHW0Lo+E9Ajt5Wk8Xsw\"",
    "mtime": "2025-08-25T09:21:50.742Z",
    "size": 787,
    "path": "../public/_ipx/s_32x32/avatar.png"
  },
  "/_ipx/s_64x64/avatar.png": {
    "type": "image/jpeg",
    "etag": "\"53f-h6X/2EyJEaJJ6uS8/1n1osSLDuY\"",
    "mtime": "2025-08-25T09:21:50.742Z",
    "size": 1343,
    "path": "../public/_ipx/s_64x64/avatar.png"
  },
  "/_ipx/w_300/i-llustration.png": {
    "type": "image/jpeg",
    "etag": "\"37d2-yIAB10vYsQev8LVsCvambVLPCMc\"",
    "mtime": "2025-08-25T09:21:50.742Z",
    "size": 14290,
    "path": "../public/_ipx/w_300/i-llustration.png"
  },
  "/_ipx/w_600/i-llustration.png": {
    "type": "image/jpeg",
    "etag": "\"719c-BNS3PGcRqjHKv4Op1jk5zaNOrxg\"",
    "mtime": "2025-08-25T09:21:50.741Z",
    "size": 29084,
    "path": "../public/_ipx/w_600/i-llustration.png"
  },
  "/ecosystem/java/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2893-5WLBv0m+B/pQaBIk8QOkd1ar6XI\"",
    "mtime": "2025-08-25T09:22:23.375Z",
    "size": 10387,
    "path": "../public/ecosystem/java/_payload.json"
  },
  "/ecosystem/java/global-cache.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"18b0e-ctNpOnPAwLfwQnyt35cTfJ6QfVI\"",
    "mtime": "2025-08-25T09:22:00.923Z",
    "size": 101134,
    "path": "../public/ecosystem/java/global-cache.html"
  },
  "/ecosystem/java/mac-install.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1e121-/glMNL0bGf005sy+01Gd8yuRWZk\"",
    "mtime": "2025-08-25T09:22:01.746Z",
    "size": 123169,
    "path": "../public/ecosystem/java/mac-install.html"
  },
  "/ecosystem/javascript/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"289f-paRrYGlChY+CLGUaKwygPVn2j5I\"",
    "mtime": "2025-08-25T09:22:21.199Z",
    "size": 10399,
    "path": "../public/ecosystem/javascript/_payload.json"
  },
  "/ecosystem/javascript/async-await.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"20dd6-s9rRweNnbLhtunj7+TwD7FF7hVg\"",
    "mtime": "2025-08-25T09:22:00.374Z",
    "size": 134614,
    "path": "../public/ecosystem/javascript/async-await.html"
  },
  "/ecosystem/javascript/fetch.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"20991-Qey48otS7O4yFQ8u5Cr17wpogO0\"",
    "mtime": "2025-08-25T09:22:01.140Z",
    "size": 133521,
    "path": "../public/ecosystem/javascript/fetch.html"
  },
  "/ecosystem/nuxt/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2893-DhR2ThS9ChpUu45aK5D9XpCeOiw\"",
    "mtime": "2025-08-25T09:22:25.219Z",
    "size": 10387,
    "path": "../public/ecosystem/nuxt/_payload.json"
  },
  "/ecosystem/nuxt/copy-page.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1c87e-EI/saNC/RJVhbnEyDfzJLtIpgio\"",
    "mtime": "2025-08-25T09:22:01.140Z",
    "size": 116862,
    "path": "../public/ecosystem/nuxt/copy-page.html"
  },
  "/ecosystem/nuxt/issues.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1b8a8-G965TsQU0t961r3YYyHQyCLmsSI\"",
    "mtime": "2025-08-25T09:22:01.669Z",
    "size": 112808,
    "path": "../public/ecosystem/nuxt/issues.html"
  },
  "/ecosystem/nuxt/llms.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1bda6-CNcYo/kwKiObu/25WPI0JrZ3LPk\"",
    "mtime": "2025-08-25T09:22:02.119Z",
    "size": 114086,
    "path": "../public/ecosystem/nuxt/llms.html"
  },
  "/ecosystem/nuxt/nuxt-seo.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"2d9c6-/4zdkOlNla+6YE/W5j2ENcIyxfg\"",
    "mtime": "2025-08-25T09:22:02.126Z",
    "size": 186822,
    "path": "../public/ecosystem/nuxt/nuxt-seo.html"
  },
  "/ecosystem/nuxt/ssr-pm2-deploy.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"2fb44-+J8V1XkJyEGFU1rp9IxzWvJCkv8\"",
    "mtime": "2025-08-25T09:22:02.306Z",
    "size": 195396,
    "path": "../public/ecosystem/nuxt/ssr-pm2-deploy.html"
  },
  "/ecosystem/styles/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2897-GR2NWYELj3BxLKPLEdt62KJ5olQ\"",
    "mtime": "2025-08-25T09:22:22.478Z",
    "size": 10391,
    "path": "../public/ecosystem/styles/_payload.json"
  },
  "/ecosystem/styles/css.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"201eb-N7Hp8lGDjSu/lv5FikKwBFRfmsw\"",
    "mtime": "2025-08-25T09:22:00.630Z",
    "size": 131563,
    "path": "../public/ecosystem/styles/css.html"
  },
  "/ecosystem/styles/sass.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"21054-VTWKPZaty6+w8Cy7Qoaz7MCBYfI\"",
    "mtime": "2025-08-25T09:22:01.800Z",
    "size": 135252,
    "path": "../public/ecosystem/styles/sass.html"
  },
  "/ecosystem/typescript/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"289f-NOYmnBt6czv0KkZhZhtT3jO0LmU\"",
    "mtime": "2025-08-25T09:22:22.806Z",
    "size": 10399,
    "path": "../public/ecosystem/typescript/_payload.json"
  },
  "/ecosystem/typescript/declare-global.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1d034-Rdhh5Yq9yE1sv/nVi3Ga/NPyd2Y\"",
    "mtime": "2025-08-25T09:22:00.773Z",
    "size": 118836,
    "path": "../public/ecosystem/typescript/declare-global.html"
  },
  "/ecosystem/ui-libraries/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"28a3-KC+aJQxjn/Hsbym9u9xK11CaFIE\"",
    "mtime": "2025-08-25T09:22:25.271Z",
    "size": 10403,
    "path": "../public/ecosystem/ui-libraries/_payload.json"
  },
  "/ecosystem/ui-libraries/element-plus.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1e8b7-7+YLg0XGnKaQ1gK1n4dCJ9HHgVI\"",
    "mtime": "2025-08-25T09:22:01.225Z",
    "size": 125111,
    "path": "../public/ecosystem/ui-libraries/element-plus.html"
  },
  "/ecosystem/vite/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2893-CYf/98NRrqRLyAF6Xo8RbGMDTqo\"",
    "mtime": "2025-08-25T09:22:23.936Z",
    "size": 10387,
    "path": "../public/ecosystem/vite/_payload.json"
  },
  "/ecosystem/vite/auto-import.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"213af-a9LHXkYZpFbQj8JO2RmgET+0hYQ\"",
    "mtime": "2025-08-25T09:22:00.937Z",
    "size": 136111,
    "path": "../public/ecosystem/vite/auto-import.html"
  },
  "/ecosystem/vite/resources-import.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1b633-i1JM+5/M4JauAEXyApcHQphrEco\"",
    "mtime": "2025-08-25T09:22:01.653Z",
    "size": 112179,
    "path": "../public/ecosystem/vite/resources-import.html"
  },
  "/ecosystem/vue/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2891-oP3KOA4Ag4i2wbcvlqkKmOGAatc\"",
    "mtime": "2025-08-25T09:22:23.657Z",
    "size": 10385,
    "path": "../public/ecosystem/vue/_payload.json"
  },
  "/ecosystem/vue/issues.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1f9e5-UzGmU7k3JJt0RliRuc9ULQ5HnMM\"",
    "mtime": "2025-08-25T09:22:00.937Z",
    "size": 129509,
    "path": "../public/ecosystem/vue/issues.html"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-dVLXFslPF6hSTZHjBnm+nLeJGgo\"",
    "mtime": "2025-08-25T09:22:47.818Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/guides/deployment/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2899-ekQoyY8cn7xzsqWtc1YKz1tZM40\"",
    "mtime": "2025-08-25T09:22:20.327Z",
    "size": 10393,
    "path": "../public/guides/deployment/_payload.json"
  },
  "/guides/deployment/digitalocean.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1d940-/9wB1CemG2ld//NOVRTEcf8jHhY\"",
    "mtime": "2025-08-25T09:21:59.137Z",
    "size": 121152,
    "path": "../public/guides/deployment/digitalocean.html"
  },
  "/guides/deployment/docker.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"2105d-yl/ZE8Hq0LUOCsgnyYkAO+x27m0\"",
    "mtime": "2025-08-25T09:22:00.161Z",
    "size": 135261,
    "path": "../public/guides/deployment/docker.html"
  },
  "/guides/deployment/postgresql-guide.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1edda-sYNgcXnoWWFW9pTlR2biU+t6ow0\"",
    "mtime": "2025-08-25T09:21:59.358Z",
    "size": 126426,
    "path": "../public/guides/deployment/postgresql-guide.html"
  },
  "/guides/os/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2889-938ShyxZVz2wvECN+7U0F9oEd1s\"",
    "mtime": "2025-08-25T09:22:20.589Z",
    "size": 10377,
    "path": "../public/guides/os/_payload.json"
  },
  "/guides/os/linux.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"14065-LW72PCqCDFWvp41SFtnpGQFGnPQ\"",
    "mtime": "2025-08-25T09:21:59.149Z",
    "size": 82021,
    "path": "../public/guides/os/linux.html"
  },
  "/guides/os/macos.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"24a28-ErTyX9PhuMjnYpne+NtyN7pXnfA\"",
    "mtime": "2025-08-25T09:21:59.219Z",
    "size": 150056,
    "path": "../public/guides/os/macos.html"
  },
  "/guides/platforms/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2897-IH5QaQRZ5kveXgz4FLrLwmZxGWA\"",
    "mtime": "2025-08-25T09:22:20.629Z",
    "size": 10391,
    "path": "../public/guides/platforms/_payload.json"
  },
  "/guides/platforms/dingtalk.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1d566-nn+0TZsZaLZUoJHhvUS938xUUJg\"",
    "mtime": "2025-08-25T09:21:59.357Z",
    "size": 120166,
    "path": "../public/guides/platforms/dingtalk.html"
  },
  "/guides/platforms/gitlab-ci.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"2ac68-TwCbZpG1ifqWwfggi2V/J74lnCU\"",
    "mtime": "2025-08-25T09:22:00.161Z",
    "size": 175208,
    "path": "../public/guides/platforms/gitlab-ci.html"
  },
  "/guides/platforms/iserver.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"21171-oxE3fq8kUOkGHxcEx44qNfqjZRk\"",
    "mtime": "2025-08-25T09:22:00.443Z",
    "size": 135537,
    "path": "../public/guides/platforms/iserver.html"
  },
  "/guides/runtime/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2893-cxGAP2mZ7/ZadFcJyq0Z0YyBRHc\"",
    "mtime": "2025-08-25T09:22:20.908Z",
    "size": 10387,
    "path": "../public/guides/runtime/_payload.json"
  },
  "/guides/runtime/node.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1f487-ptkw2dKe6lxh5YFJuJNtMCytV2o\"",
    "mtime": "2025-08-25T09:21:59.358Z",
    "size": 128135,
    "path": "../public/guides/runtime/node.html"
  },
  "/images/readme/homepage.png": {
    "type": "image/png",
    "etag": "\"feebb-tBP8oOuHFa7Ui5iUk+/aJ/75chE\"",
    "mtime": "2025-08-25T09:22:47.880Z",
    "size": 1044155,
    "path": "../public/images/readme/homepage.png"
  },
  "/tools/editors/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2891-EwurU8i2a4RPZQ++RniZy8srsRc\"",
    "mtime": "2025-08-25T09:22:20.030Z",
    "size": 10385,
    "path": "../public/tools/editors/_payload.json"
  },
  "/tools/editors/idea.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"14f34-qINfQA9DhMHko5nX8OcLmp0ccJs\"",
    "mtime": "2025-08-25T09:21:58.118Z",
    "size": 85812,
    "path": "../public/tools/editors/idea.html"
  },
  "/tools/editors/vscode.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"19136-zoF+V+TrtOiAJRdumhPpPt7pzQg\"",
    "mtime": "2025-08-25T09:21:58.096Z",
    "size": 102710,
    "path": "../public/tools/editors/vscode.html"
  },
  "/tools/package-managers/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"28a3-TwtlU56DYyXrtGppKApWzE4MwLw\"",
    "mtime": "2025-08-25T09:22:17.950Z",
    "size": 10403,
    "path": "../public/tools/package-managers/_payload.json"
  },
  "/tools/package-managers/homebrew.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1a1f3-jlSxHl1wrxbfNHF6wwxmz5/hkSU\"",
    "mtime": "2025-08-25T09:21:58.096Z",
    "size": 106995,
    "path": "../public/tools/package-managers/homebrew.html"
  },
  "/tools/package-managers/pnpm.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"16234-5OWZREi7q8Xo8vHeCrso+Xbh52E\"",
    "mtime": "2025-08-25T09:21:58.095Z",
    "size": 90676,
    "path": "../public/tools/package-managers/pnpm.html"
  },
  "/tools/version-control/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"28a1-xH1kxAxkrNeiSL26Sj5yNq365MY\"",
    "mtime": "2025-08-25T09:22:19.513Z",
    "size": 10401,
    "path": "../public/tools/version-control/_payload.json"
  },
  "/tools/version-control/fnm.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1da70-6dT91hT6DmynxmMSb4Lse/YJtrs\"",
    "mtime": "2025-08-25T09:21:58.096Z",
    "size": 121456,
    "path": "../public/tools/version-control/fnm.html"
  },
  "/tools/version-control/git.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"294d0-JyT0BS3JR+gIZPfeBh+9iIt7LU0\"",
    "mtime": "2025-08-25T09:21:58.096Z",
    "size": 169168,
    "path": "../public/tools/version-control/git.html"
  },
  "/__og-image__/static/ecosystem/og.png": {
    "type": "image/png",
    "etag": "\"4eb41-omS6xpaEmpzs4uXFYffRaysGCvY\"",
    "mtime": "2025-08-25T09:22:02.301Z",
    "size": 322369,
    "path": "../public/__og-image__/static/ecosystem/og.png"
  },
  "/__og-image__/static/guides/og.png": {
    "type": "image/png",
    "etag": "\"4d7dd-wk9stGY1n43zOPixechThbmXV0U\"",
    "mtime": "2025-08-25T09:22:00.242Z",
    "size": 317405,
    "path": "../public/__og-image__/static/guides/og.png"
  },
  "/__og-image__/static/tools/og.png": {
    "type": "image/png",
    "etag": "\"4c1f2-sQ3xnBGHirGJz2LOkdo8Atw2E3o\"",
    "mtime": "2025-08-25T09:21:58.118Z",
    "size": 311794,
    "path": "../public/__og-image__/static/tools/og.png"
  },
  "/ecosystem/java/global-cache/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"30a5-9DThBjxFrgT9Agc46bA98VvHaVY\"",
    "mtime": "2025-08-25T09:22:11.760Z",
    "size": 12453,
    "path": "../public/ecosystem/java/global-cache/_payload.json"
  },
  "/ecosystem/java/mac-install/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5d26-GIe5WCmfJM749r5uew1r9297Ies\"",
    "mtime": "2025-08-25T09:22:15.443Z",
    "size": 23846,
    "path": "../public/ecosystem/java/mac-install/_payload.json"
  },
  "/ecosystem/javascript/async-await/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"9b83-eN5XxnQ1J3zfU/wNrfUhYuCB2NM\"",
    "mtime": "2025-08-25T09:22:10.411Z",
    "size": 39811,
    "path": "../public/ecosystem/javascript/async-await/_payload.json"
  },
  "/ecosystem/javascript/fetch/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"94e7-Vg96aHf5JTM71qQUbSHQdRas150\"",
    "mtime": "2025-08-25T09:22:14.085Z",
    "size": 38119,
    "path": "../public/ecosystem/javascript/fetch/_payload.json"
  },
  "/ecosystem/nuxt/copy-page/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5257-xS+CSnK6pD4EH0/4WGKYM6pGnXs\"",
    "mtime": "2025-08-25T09:22:14.471Z",
    "size": 21079,
    "path": "../public/ecosystem/nuxt/copy-page/_payload.json"
  },
  "/ecosystem/nuxt/issues/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"4611-JTZbVgVRJ0060bMUwtJncahxxsY\"",
    "mtime": "2025-08-25T09:22:15.417Z",
    "size": 17937,
    "path": "../public/ecosystem/nuxt/issues/_payload.json"
  },
  "/ecosystem/nuxt/llms/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5b1b-zBLumtbxeeoWqv5Qkp7lgJlyK3A\"",
    "mtime": "2025-08-25T09:22:17.078Z",
    "size": 23323,
    "path": "../public/ecosystem/nuxt/llms/_payload.json"
  },
  "/ecosystem/nuxt/nuxt-seo/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"1121b-oJ68W/PqNvjhxXcmzN53tPz/VBg\"",
    "mtime": "2025-08-25T09:22:17.643Z",
    "size": 70171,
    "path": "../public/ecosystem/nuxt/nuxt-seo/_payload.json"
  },
  "/ecosystem/nuxt/ssr-pm2-deploy/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"1193d-6UpsEcIQ62oxnSXKKaMxO76Ikik\"",
    "mtime": "2025-08-25T09:22:18.221Z",
    "size": 71997,
    "path": "../public/ecosystem/nuxt/ssr-pm2-deploy/_payload.json"
  },
  "/ecosystem/styles/css/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"7146-cQr5fcYyMxcttZqSzFGLXHh495A\"",
    "mtime": "2025-08-25T09:22:11.596Z",
    "size": 28998,
    "path": "../public/ecosystem/styles/css/_payload.json"
  },
  "/ecosystem/styles/sass/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"767c-rCO4ZowCzVN5uNzDdTwr7UGO4oY\"",
    "mtime": "2025-08-25T09:22:16.769Z",
    "size": 30332,
    "path": "../public/ecosystem/styles/sass/_payload.json"
  },
  "/ecosystem/typescript/declare-global/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5bf4-5/Q+vf3o1snyZMNERyPzMAuNdrU\"",
    "mtime": "2025-08-25T09:22:11.688Z",
    "size": 23540,
    "path": "../public/ecosystem/typescript/declare-global/_payload.json"
  },
  "/ecosystem/ui-libraries/element-plus/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"88c2-R1xvgbtgLknUmek2rxQtbPiKKRk\"",
    "mtime": "2025-08-25T09:22:14.841Z",
    "size": 35010,
    "path": "../public/ecosystem/ui-libraries/element-plus/_payload.json"
  },
  "/ecosystem/vite/auto-import/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"7c10-jjX1BWH0bUT14aQJE1KYxZPmpqo\"",
    "mtime": "2025-08-25T09:22:13.762Z",
    "size": 31760,
    "path": "../public/ecosystem/vite/auto-import/_payload.json"
  },
  "/ecosystem/vite/resources-import/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"4e50-93tDqnqsFhxK2P4pfukawP5HcjU\"",
    "mtime": "2025-08-25T09:22:15.144Z",
    "size": 20048,
    "path": "../public/ecosystem/vite/resources-import/_payload.json"
  },
  "/ecosystem/vue/issues/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"6463-F/plVcWN7kcig8S0p3jeGRNOYdM\"",
    "mtime": "2025-08-25T09:22:12.142Z",
    "size": 25699,
    "path": "../public/ecosystem/vue/issues/_payload.json"
  },
  "/_nuxt/builds/meta/b67d41df-2d66-403b-a575-e428bbeff679.json": {
    "type": "application/json",
    "etag": "\"5d0-lmg7zJQ2BPm9ahmtONv7RYttY6w\"",
    "mtime": "2025-08-25T09:22:47.813Z",
    "size": 1488,
    "path": "../public/_nuxt/builds/meta/b67d41df-2d66-403b-a575-e428bbeff679.json"
  },
  "/guides/deployment/digitalocean/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"4f2c-DvbHdWkTOxvjuBtSxD0dWQgMahA\"",
    "mtime": "2025-08-25T09:22:05.886Z",
    "size": 20268,
    "path": "../public/guides/deployment/digitalocean/_payload.json"
  },
  "/guides/deployment/docker/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"bcb7-g9VvGH6p4C7y9ZiCE5p83rFzDzM\"",
    "mtime": "2025-08-25T09:22:09.653Z",
    "size": 48311,
    "path": "../public/guides/deployment/docker/_payload.json"
  },
  "/guides/deployment/postgresql-guide/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"7667-kPjF8VGoDrfCcr82FtEjNIpjn+E\"",
    "mtime": "2025-08-25T09:22:07.934Z",
    "size": 30311,
    "path": "../public/guides/deployment/postgresql-guide/_payload.json"
  },
  "/guides/os/linux/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"2dc6-4oVYSbRaV21M0dbVNyuY/6aZlT0\"",
    "mtime": "2025-08-25T09:22:05.976Z",
    "size": 11718,
    "path": "../public/guides/os/linux/_payload.json"
  },
  "/guides/os/macos/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"7b6d-bacyCpuy1MMDcXfkFn9ILEVOF7E\"",
    "mtime": "2025-08-25T09:22:07.754Z",
    "size": 31597,
    "path": "../public/guides/os/macos/_payload.json"
  },
  "/guides/platforms/dingtalk/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"14c2b-BqoqXlvG1XAOj4qVqa+mIuBVMTM\"",
    "mtime": "2025-08-25T09:22:07.898Z",
    "size": 85035,
    "path": "../public/guides/platforms/dingtalk/_payload.json"
  },
  "/guides/platforms/gitlab-ci/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"264d4-QXWdUBRrwTIHSUSrlSX4wjP9urQ\"",
    "mtime": "2025-08-25T09:22:09.113Z",
    "size": 156884,
    "path": "../public/guides/platforms/gitlab-ci/_payload.json"
  },
  "/guides/platforms/iserver/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5fac-E6QYMVneCQbPe3hzHfdeExvnkDM\"",
    "mtime": "2025-08-25T09:22:11.469Z",
    "size": 24492,
    "path": "../public/guides/platforms/iserver/_payload.json"
  },
  "/guides/runtime/node/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"7a38-KwhM6s97yLqDhlky2aI7Bu9RuUY\"",
    "mtime": "2025-08-25T09:22:07.920Z",
    "size": 31288,
    "path": "../public/guides/runtime/node/_payload.json"
  },
  "/images/ecosystem/nuxt/og-image.png": {
    "type": "image/png",
    "etag": "\"33047-1+CyGWYOUU4h52i2LLSNKgugaQo\"",
    "mtime": "2025-08-25T09:22:47.880Z",
    "size": 208967,
    "path": "../public/images/ecosystem/nuxt/og-image.png"
  },
  "/images/ecosystem/nuxt/sitemap.png": {
    "type": "image/png",
    "etag": "\"44ae9-ZBclX4lBjPnsAhQZplQ1PKoGBnQ\"",
    "mtime": "2025-08-25T09:22:47.881Z",
    "size": 281321,
    "path": "../public/images/ecosystem/nuxt/sitemap.png"
  },
  "/images/ecosystem/nuxt/verify-pm2.png": {
    "type": "image/png",
    "etag": "\"2809e8-/iFSYY8GT1rb3aXg5Nfy7QjYt8w\"",
    "mtime": "2025-08-25T09:22:47.885Z",
    "size": 2623976,
    "path": "../public/images/ecosystem/nuxt/verify-pm2.png"
  },
  "/tools/editors/idea/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"3a4d-boKWYD7zxouV2j0NUQftYHE2viU\"",
    "mtime": "2025-08-25T09:22:04.787Z",
    "size": 14925,
    "path": "../public/tools/editors/idea/_payload.json"
  },
  "/tools/editors/vscode/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5943-iU8yS2WbiQWwsKF2jJiLEuvImLM\"",
    "mtime": "2025-08-25T09:22:04.613Z",
    "size": 22851,
    "path": "../public/tools/editors/vscode/_payload.json"
  },
  "/tools/package-managers/homebrew/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"54e2-wcDEd4hOGXrVjiUSNUhu5f7hNrE\"",
    "mtime": "2025-08-25T09:22:02.306Z",
    "size": 21730,
    "path": "../public/tools/package-managers/homebrew/_payload.json"
  },
  "/tools/package-managers/pnpm/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"3ea1-mXJvWE4RTZX6+hd25zIwbezMVVE\"",
    "mtime": "2025-08-25T09:22:02.129Z",
    "size": 16033,
    "path": "../public/tools/package-managers/pnpm/_payload.json"
  },
  "/tools/version-control/fnm/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"5c4f-MSElYt5X5dCxZ2GI4zFjgAXt2QQ\"",
    "mtime": "2025-08-25T09:22:02.256Z",
    "size": 23631,
    "path": "../public/tools/version-control/fnm/_payload.json"
  },
  "/tools/version-control/git/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"82e1-rDCuDoEufyD8ziiT7IwFDARGvGg\"",
    "mtime": "2025-08-25T09:22:04.738Z",
    "size": 33505,
    "path": "../public/tools/version-control/git/_payload.json"
  },
  "/__og-image__/static/ecosystem/java/og.png": {
    "type": "image/png",
    "etag": "\"5012b-kTxHoKSKbyYPTxqEsR+YNVJnvHA\"",
    "mtime": "2025-08-25T09:22:25.249Z",
    "size": 327979,
    "path": "../public/__og-image__/static/ecosystem/java/og.png"
  },
  "/__og-image__/static/ecosystem/javascript/og.png": {
    "type": "image/png",
    "etag": "\"4df58-hYg8Kuj3HxE2qBQipCISwJbk1T4\"",
    "mtime": "2025-08-25T09:22:23.657Z",
    "size": 319320,
    "path": "../public/__og-image__/static/ecosystem/javascript/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/og.png": {
    "type": "image/png",
    "etag": "\"4f5fb-00X3sWnXyCZsxhR/076ldDq7eWA\"",
    "mtime": "2025-08-25T09:22:26.068Z",
    "size": 325115,
    "path": "../public/__og-image__/static/ecosystem/nuxt/og.png"
  },
  "/__og-image__/static/ecosystem/styles/og.png": {
    "type": "image/png",
    "etag": "\"4d987-e5wJBti3sW49hMVNzrFBT+XFhfs\"",
    "mtime": "2025-08-25T09:22:23.947Z",
    "size": 317831,
    "path": "../public/__og-image__/static/ecosystem/styles/og.png"
  },
  "/__og-image__/static/ecosystem/typescript/og.png": {
    "type": "image/png",
    "etag": "\"4df8a-3mTPh/HLDvyHsaM7o/QiJQwPz+4\"",
    "mtime": "2025-08-25T09:22:25.219Z",
    "size": 319370,
    "path": "../public/__og-image__/static/ecosystem/typescript/og.png"
  },
  "/__og-image__/static/ecosystem/ui-libraries/og.png": {
    "type": "image/png",
    "etag": "\"4bda1-sRAEzAdJhNE7RljuksaIZzHpH1Q\"",
    "mtime": "2025-08-25T09:22:26.078Z",
    "size": 310689,
    "path": "../public/__og-image__/static/ecosystem/ui-libraries/og.png"
  },
  "/__og-image__/static/ecosystem/vite/og.png": {
    "type": "image/png",
    "etag": "\"4edab-Q0ilKtGANjA/tEl7AziXcN+Coy0\"",
    "mtime": "2025-08-25T09:22:25.822Z",
    "size": 322987,
    "path": "../public/__og-image__/static/ecosystem/vite/og.png"
  },
  "/__og-image__/static/ecosystem/vue/og.png": {
    "type": "image/png",
    "etag": "\"4d723-vy9WVqiD3iWme/793lgmgmPK9rg\"",
    "mtime": "2025-08-25T09:22:25.536Z",
    "size": 317219,
    "path": "../public/__og-image__/static/ecosystem/vue/og.png"
  },
  "/__og-image__/static/guides/deployment/og.png": {
    "type": "image/png",
    "etag": "\"4e001-k3k1AhQHXvmEfwhIjUqewBQb/gw\"",
    "mtime": "2025-08-25T09:22:21.201Z",
    "size": 319489,
    "path": "../public/__og-image__/static/guides/deployment/og.png"
  },
  "/__og-image__/static/guides/os/og.png": {
    "type": "image/png",
    "etag": "\"4d3c5-0+admFEdc7Dlu+NunNPG9grailU\"",
    "mtime": "2025-08-25T09:22:22.805Z",
    "size": 316357,
    "path": "../public/__og-image__/static/guides/os/og.png"
  },
  "/__og-image__/static/guides/platforms/og.png": {
    "type": "image/png",
    "etag": "\"4cedf-8ux2ibFacDZYsm591hf3AVpYgR4\"",
    "mtime": "2025-08-25T09:22:23.105Z",
    "size": 315103,
    "path": "../public/__og-image__/static/guides/platforms/og.png"
  },
  "/__og-image__/static/guides/runtime/og.png": {
    "type": "image/png",
    "etag": "\"4e5d8-1UWTp+87Omof8Z+KqnlCKGx8BLw\"",
    "mtime": "2025-08-25T09:22:23.375Z",
    "size": 320984,
    "path": "../public/__og-image__/static/guides/runtime/og.png"
  },
  "/__og-image__/static/tools/editors/og.png": {
    "type": "image/png",
    "etag": "\"4d271-CyhCZE6CxrF8nnRkG807LIMtDkA\"",
    "mtime": "2025-08-25T09:22:20.920Z",
    "size": 316017,
    "path": "../public/__og-image__/static/tools/editors/og.png"
  },
  "/__og-image__/static/tools/package-managers/og.png": {
    "type": "image/png",
    "etag": "\"4d129-nlqWVon4GDZURDaVdckL8psZSlM\"",
    "mtime": "2025-08-25T09:22:20.015Z",
    "size": 315689,
    "path": "../public/__og-image__/static/tools/package-managers/og.png"
  },
  "/__og-image__/static/tools/version-control/og.png": {
    "type": "image/png",
    "etag": "\"4d877-aJYVNJJm78eBb63vWGYSZ52bWSs\"",
    "mtime": "2025-08-25T09:22:20.629Z",
    "size": 317559,
    "path": "../public/__og-image__/static/tools/version-control/og.png"
  },
  "/images/guides/deployment/digitalocean/create-droplets-config.png": {
    "type": "image/png",
    "etag": "\"1165a2-hYGJ3wSsqlQ/2GDpTBNyeIUGBNo\"",
    "mtime": "2025-08-25T09:22:47.882Z",
    "size": 1140130,
    "path": "../public/images/guides/deployment/digitalocean/create-droplets-config.png"
  },
  "/images/guides/deployment/digitalocean/create-entry.png": {
    "type": "image/png",
    "etag": "\"b020a-7Oz/Asag8OxMmUXml0MvhQTuTIM\"",
    "mtime": "2025-08-25T09:22:47.893Z",
    "size": 721418,
    "path": "../public/images/guides/deployment/digitalocean/create-entry.png"
  },
  "/images/guides/deployment/digitalocean/droplets-dashboard.png": {
    "type": "image/png",
    "etag": "\"384cb-csE10Qp8GRI8D9xhVcaBGgzNVD0\"",
    "mtime": "2025-08-25T09:22:47.892Z",
    "size": 230603,
    "path": "../public/images/guides/deployment/digitalocean/droplets-dashboard.png"
  },
  "/images/guides/deployment/docker/cloudflare-a-record.png": {
    "type": "image/png",
    "etag": "\"6b63f-Q86J5Bq9boXzpElXftG7wnoI9no\"",
    "mtime": "2025-08-25T09:22:47.884Z",
    "size": 439871,
    "path": "../public/images/guides/deployment/docker/cloudflare-a-record.png"
  },
  "/images/guides/deployment/docker/cloudflare-create-certificate.png": {
    "type": "image/png",
    "etag": "\"723c1-iiol1ydjmG/+PxG3fpPgrM95k5k\"",
    "mtime": "2025-08-25T09:22:47.886Z",
    "size": 467905,
    "path": "../public/images/guides/deployment/docker/cloudflare-create-certificate.png"
  },
  "/images/guides/deployment/docker/docker-compose-result.png": {
    "type": "image/png",
    "etag": "\"1467d-n9cTgdD+EsDS8EEzb+z2eJSn0xY\"",
    "mtime": "2025-08-25T09:22:47.886Z",
    "size": 83581,
    "path": "../public/images/guides/deployment/docker/docker-compose-result.png"
  },
  "/images/guides/os/macos/iterm2-default.png": {
    "type": "image/png",
    "etag": "\"247df-ATKdUeVk5Vrqyd+rWzu4kfAzzwc\"",
    "mtime": "2025-08-25T09:22:47.884Z",
    "size": 149471,
    "path": "../public/images/guides/os/macos/iterm2-default.png"
  },
  "/images/guides/os/macos/iterm2-import.png": {
    "type": "image/png",
    "etag": "\"59cca-qKKa/loTqFE3ze+hHTI4AFDLznc\"",
    "mtime": "2025-08-25T09:22:47.891Z",
    "size": 367818,
    "path": "../public/images/guides/os/macos/iterm2-import.png"
  },
  "/images/guides/os/macos/iterm2-status-active.png": {
    "type": "image/png",
    "etag": "\"3dbbf-tyGjRvaLADuigXpivz0LSRUuVgc\"",
    "mtime": "2025-08-25T09:22:47.886Z",
    "size": 252863,
    "path": "../public/images/guides/os/macos/iterm2-status-active.png"
  },
  "/images/guides/os/macos/iterm2-status.png": {
    "type": "image/png",
    "etag": "\"4bfb2-UX7pjtWdPUBnSadv/yyiLzSsPa0\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 311218,
    "path": "../public/images/guides/os/macos/iterm2-status.png"
  },
  "/images/guides/os/macos/iterm2-theme.png": {
    "type": "image/png",
    "etag": "\"67d3e-JTVqYmJA55muQWyfN96ADCrTDx8\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 425278,
    "path": "../public/images/guides/os/macos/iterm2-theme.png"
  },
  "/images/guides/os/macos/iterm2.png": {
    "type": "image/png",
    "etag": "\"101c8-LK6HzXcxzx1rDZUQdmmWg+qcU10\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 65992,
    "path": "../public/images/guides/os/macos/iterm2.png"
  },
  "/images/guides/platforms/gitlab-ci/build-deploy-workflow.png": {
    "type": "image/png",
    "etag": "\"19445-WeMdFEhNnhw58MZC1OojYMxknY8\"",
    "mtime": "2025-08-25T09:22:47.884Z",
    "size": 103493,
    "path": "../public/images/guides/platforms/gitlab-ci/build-deploy-workflow.png"
  },
  "/images/guides/platforms/gitlab-ci/ci-start-notify.png": {
    "type": "image/png",
    "etag": "\"e820-v+HEjgF3c1+ctwwpwvg0ef4y+ZM\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 59424,
    "path": "../public/images/guides/platforms/gitlab-ci/ci-start-notify.png"
  },
  "/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png": {
    "type": "image/png",
    "etag": "\"12615-eSX4DjQAxE4C7MYCbyO5tkT5Qc4\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 75285,
    "path": "../public/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png"
  },
  "/images/guides/platforms/gitlab-ci/manual-run-pipeline.png": {
    "type": "image/png",
    "etag": "\"4dd5f-R37MnGVV6ulcTBTlGlBxL17dCSE\"",
    "mtime": "2025-08-25T09:22:47.892Z",
    "size": 318815,
    "path": "../public/images/guides/platforms/gitlab-ci/manual-run-pipeline.png"
  },
  "/images/guides/platforms/gitlab-ci/merge-request-start.png": {
    "type": "image/png",
    "etag": "\"819a-m6Mjqxlr8b9tBuK6KNzuDivoEhM\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 33178,
    "path": "../public/images/guides/platforms/gitlab-ci/merge-request-start.png"
  },
  "/images/guides/platforms/gitlab-ci/merge-request-workflow.png": {
    "type": "image/png",
    "etag": "\"135bf-UJ0zud6aHshNZeO1IJrMn20H+Ps\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 79295,
    "path": "../public/images/guides/platforms/gitlab-ci/merge-request-workflow.png"
  },
  "/images/guides/platforms/iserver/dataInterface.png": {
    "type": "image/png",
    "etag": "\"1ad08-jqOFebmFbm828txfy9oDpBNLVCk\"",
    "mtime": "2025-08-25T09:22:47.884Z",
    "size": 109832,
    "path": "../public/images/guides/platforms/iserver/dataInterface.png"
  },
  "/images/guides/platforms/iserver/geojson.png": {
    "type": "image/png",
    "etag": "\"9545-h2U5uccg1qsPqgH3Gglp4GqnVCI\"",
    "mtime": "2025-08-25T09:22:47.887Z",
    "size": 38213,
    "path": "../public/images/guides/platforms/iserver/geojson.png"
  },
  "/images/guides/platforms/iserver/mapInterface.png": {
    "type": "image/png",
    "etag": "\"1e9e5-iwGVM8vkG3kNJnPUKTz5qgldTDc\"",
    "mtime": "2025-08-25T09:22:47.888Z",
    "size": 125413,
    "path": "../public/images/guides/platforms/iserver/mapInterface.png"
  },
  "/images/guides/platforms/iserver/releaseError.png": {
    "type": "image/png",
    "etag": "\"c011-EjpGi23snIECKNHTjb5HQLCzKKc\"",
    "mtime": "2025-08-25T09:22:47.888Z",
    "size": 49169,
    "path": "../public/images/guides/platforms/iserver/releaseError.png"
  },
  "/images/guides/platforms/iserver/sceneInterface.png": {
    "type": "image/png",
    "etag": "\"1991a-7ZFcyHsbHH4Ci66SsW1qTAycKtc\"",
    "mtime": "2025-08-25T09:22:47.888Z",
    "size": 104730,
    "path": "../public/images/guides/platforms/iserver/sceneInterface.png"
  },
  "/images/guides/platforms/iserver/sldBody.png": {
    "type": "image/png",
    "etag": "\"25879-sZ3pE/gVhPy228EQJ9BIUj5lhsY\"",
    "mtime": "2025-08-25T09:22:47.888Z",
    "size": 153721,
    "path": "../public/images/guides/platforms/iserver/sldBody.png"
  },
  "/images/guides/platforms/iserver/sldBodyReply.png": {
    "type": "image/png",
    "etag": "\"4c5f8-lItWX0uUqPkJ5TcWdYNJgvlYTbY\"",
    "mtime": "2025-08-25T09:22:47.889Z",
    "size": 312824,
    "path": "../public/images/guides/platforms/iserver/sldBodyReply.png"
  },
  "/images/guides/platforms/iserver/wfsError1.png": {
    "type": "image/png",
    "etag": "\"24672-6/UeR20MMS9HK+QSzrPFqOQwSKQ\"",
    "mtime": "2025-08-25T09:22:47.889Z",
    "size": 149106,
    "path": "../public/images/guides/platforms/iserver/wfsError1.png"
  },
  "/images/guides/platforms/iserver/wfsError2.png": {
    "type": "image/png",
    "etag": "\"1bcb9-DgBkvsmerawdNHTULGsV0I9FmTQ\"",
    "mtime": "2025-08-25T09:22:47.889Z",
    "size": 113849,
    "path": "../public/images/guides/platforms/iserver/wfsError2.png"
  },
  "/images/guides/platforms/iserver/wfsError3.png": {
    "type": "image/png",
    "etag": "\"86c2e-UpHBn5Mo+vynPqFQqVGEZbjNick\"",
    "mtime": "2025-08-25T09:22:47.889Z",
    "size": 551982,
    "path": "../public/images/guides/platforms/iserver/wfsError3.png"
  },
  "/images/guides/platforms/iserver/wfsError4.png": {
    "type": "image/png",
    "etag": "\"1f9d5-SpGV3Asny+OBG4IUKoU3CMOjDXA\"",
    "mtime": "2025-08-25T09:22:47.889Z",
    "size": 129493,
    "path": "../public/images/guides/platforms/iserver/wfsError4.png"
  },
  "/images/guides/platforms/iserver/wms130.png": {
    "type": "image/png",
    "etag": "\"556cb-4JIyFNaV3r6NteDvCP01neBz3rc\"",
    "mtime": "2025-08-25T09:22:47.890Z",
    "size": 349899,
    "path": "../public/images/guides/platforms/iserver/wms130.png"
  },
  "/images/guides/platforms/iserver/zxyTileImage.png": {
    "type": "image/png",
    "etag": "\"4b079-PK+olzBkdhlv+dl6OHeBjAyzUTs\"",
    "mtime": "2025-08-25T09:22:47.890Z",
    "size": 307321,
    "path": "../public/images/guides/platforms/iserver/zxyTileImage.png"
  },
  "/images/tools/editors/idea/copyright.png": {
    "type": "image/png",
    "etag": "\"3721f-zQN/A2/vVsi4svDsGTqvI4nSCaE\"",
    "mtime": "2025-08-25T09:22:47.883Z",
    "size": 225823,
    "path": "../public/images/tools/editors/idea/copyright.png"
  },
  "/images/tools/editors/vscode/add-vscode-action.png": {
    "type": "image/png",
    "etag": "\"5bb31-5Lyu/9IGxge2Htn61yhcpRW0hpI\"",
    "mtime": "2025-08-25T09:22:47.893Z",
    "size": 375601,
    "path": "../public/images/tools/editors/vscode/add-vscode-action.png"
  },
  "/images/tools/editors/vscode/git-prune.png": {
    "type": "image/png",
    "etag": "\"ec50-WpEz6sPST1phjjJmXHdniSXrFvM\"",
    "mtime": "2025-08-25T09:22:47.893Z",
    "size": 60496,
    "path": "../public/images/tools/editors/vscode/git-prune.png"
  },
  "/images/tools/editors/vscode/git-vscode-gpg.png": {
    "type": "image/png",
    "etag": "\"5caa-9MeDoMcFI5nttfgmf2wMV2qYUEY\"",
    "mtime": "2025-08-25T09:22:47.885Z",
    "size": 23722,
    "path": "../public/images/tools/editors/vscode/git-vscode-gpg.png"
  },
  "/images/tools/editors/vscode/gitlens-commit-message.png": {
    "type": "image/png",
    "etag": "\"59635-K7AI7vBdJbTGR59Uvam8X3FOI+c\"",
    "mtime": "2025-08-25T09:22:47.890Z",
    "size": 366133,
    "path": "../public/images/tools/editors/vscode/gitlens-commit-message.png"
  },
  "/images/tools/editors/vscode/quick-operating.png": {
    "type": "image/png",
    "etag": "\"3db09-y5OmN7GDWQWEZVtxudyJKPa5BwM\"",
    "mtime": "2025-08-25T09:22:47.890Z",
    "size": 252681,
    "path": "../public/images/tools/editors/vscode/quick-operating.png"
  },
  "/images/tools/editors/vscode/service-config.png": {
    "type": "image/png",
    "etag": "\"aaf35-o4qv2dYGCSI8NpETelgasZfPvWc\"",
    "mtime": "2025-08-25T09:22:47.891Z",
    "size": 700213,
    "path": "../public/images/tools/editors/vscode/service-config.png"
  },
  "/images/tools/editors/vscode/use-service.png": {
    "type": "image/png",
    "etag": "\"1d0c2-scJp4HWZXRirrrA9S7XQvoE8jZ8\"",
    "mtime": "2025-08-25T09:22:47.891Z",
    "size": 118978,
    "path": "../public/images/tools/editors/vscode/use-service.png"
  },
  "/__og-image__/static/ecosystem/java/global-cache/og.png": {
    "type": "image/png",
    "etag": "\"4f6ad-SLtqhifN2whLHmXSyUTxG3vtC0g\"",
    "mtime": "2025-08-25T09:22:14.166Z",
    "size": 325293,
    "path": "../public/__og-image__/static/ecosystem/java/global-cache/og.png"
  },
  "/__og-image__/static/ecosystem/java/mac-install/og.png": {
    "type": "image/png",
    "etag": "\"50b94-OGN3qT9BsfigJmmUWeO9sFIQ+Lg\"",
    "mtime": "2025-08-25T09:22:17.646Z",
    "size": 330644,
    "path": "../public/__og-image__/static/ecosystem/java/mac-install/og.png"
  },
  "/__og-image__/static/ecosystem/javascript/async-await/og.png": {
    "type": "image/png",
    "etag": "\"4e3a0-BR0BXQ55lbkVE6AC1knFlN1IA3A\"",
    "mtime": "2025-08-25T09:22:11.416Z",
    "size": 320416,
    "path": "../public/__og-image__/static/ecosystem/javascript/async-await/og.png"
  },
  "/__og-image__/static/ecosystem/javascript/fetch/og.png": {
    "type": "image/png",
    "etag": "\"4dfeb-ikh9laa3W4ng0Vm3Vassgcu6Cxg\"",
    "mtime": "2025-08-25T09:22:15.144Z",
    "size": 319467,
    "path": "../public/__og-image__/static/ecosystem/javascript/fetch/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/copy-page/og.png": {
    "type": "image/png",
    "etag": "\"4fe98-IdcvLxIqKK4Vw3SonQdYBs3TvOY\"",
    "mtime": "2025-08-25T09:22:16.772Z",
    "size": 327320,
    "path": "../public/__og-image__/static/ecosystem/nuxt/copy-page/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/issues/og.png": {
    "type": "image/png",
    "etag": "\"4e3d4-iPKNEXQTHM0/xxlcXEMKLkEWsbA\"",
    "mtime": "2025-08-25T09:22:17.644Z",
    "size": 320468,
    "path": "../public/__og-image__/static/ecosystem/nuxt/issues/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/llms/og.png": {
    "type": "image/png",
    "etag": "\"4edcd-dyCdxkEsT/d/CemmwT/EttWiWbk\"",
    "mtime": "2025-08-25T09:22:18.214Z",
    "size": 323021,
    "path": "../public/__og-image__/static/ecosystem/nuxt/llms/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/nuxt-seo/og.png": {
    "type": "image/png",
    "etag": "\"4c685-VkS9kPqNfoDqdzFQxPuu2I+iY6Q\"",
    "mtime": "2025-08-25T09:22:19.505Z",
    "size": 312965,
    "path": "../public/__og-image__/static/ecosystem/nuxt/nuxt-seo/og.png"
  },
  "/__og-image__/static/ecosystem/nuxt/ssr-pm2-deploy/og.png": {
    "type": "image/png",
    "etag": "\"52d77-BVDOhOHCj1HbL3oAN/ldIunYHms\"",
    "mtime": "2025-08-25T09:22:20.073Z",
    "size": 339319,
    "path": "../public/__og-image__/static/ecosystem/nuxt/ssr-pm2-deploy/og.png"
  },
  "/__og-image__/static/ecosystem/styles/css/og.png": {
    "type": "image/png",
    "etag": "\"4eb51-Vc+DJ11VkEyD6nIrf3z/0fgDG38\"",
    "mtime": "2025-08-25T09:22:13.770Z",
    "size": 322385,
    "path": "../public/__og-image__/static/ecosystem/styles/css/og.png"
  },
  "/__og-image__/static/ecosystem/styles/sass/og.png": {
    "type": "image/png",
    "etag": "\"4ed49-YuBKFtND4UGQyniQTTrslImQIXE\"",
    "mtime": "2025-08-25T09:22:17.949Z",
    "size": 322889,
    "path": "../public/__og-image__/static/ecosystem/styles/sass/og.png"
  },
  "/__og-image__/static/ecosystem/typescript/declare-global/og.png": {
    "type": "image/png",
    "etag": "\"4c8b2-qR+QLOB9IrRpXfzEBjLM8Q3odoI\"",
    "mtime": "2025-08-25T09:22:14.100Z",
    "size": 313522,
    "path": "../public/__og-image__/static/ecosystem/typescript/declare-global/og.png"
  },
  "/__og-image__/static/ecosystem/ui-libraries/element-plus/og.png": {
    "type": "image/png",
    "etag": "\"4ee8a-sMXq7YhAUZ830iKvc7ruk7nIrYA\"",
    "mtime": "2025-08-25T09:22:16.794Z",
    "size": 323210,
    "path": "../public/__og-image__/static/ecosystem/ui-libraries/element-plus/og.png"
  },
  "/__og-image__/static/ecosystem/vite/auto-import/og.png": {
    "type": "image/png",
    "etag": "\"4f3d3-dm2UB3TMGvlPmmL2IQH0hWToeYE\"",
    "mtime": "2025-08-25T09:22:14.883Z",
    "size": 324563,
    "path": "../public/__og-image__/static/ecosystem/vite/auto-import/og.png"
  },
  "/__og-image__/static/ecosystem/vite/resources-import/og.png": {
    "type": "image/png",
    "etag": "\"502f6-n7za2eK5dqXwdOSD4nUz5eiBnNQ\"",
    "mtime": "2025-08-25T09:22:17.341Z",
    "size": 328438,
    "path": "../public/__og-image__/static/ecosystem/vite/resources-import/og.png"
  },
  "/__og-image__/static/ecosystem/vue/issues/og.png": {
    "type": "image/png",
    "etag": "\"4e2fb-TeeTvw0nJlQbxVkrTmfoRnCFJ60\"",
    "mtime": "2025-08-25T09:22:14.541Z",
    "size": 320251,
    "path": "../public/__og-image__/static/ecosystem/vue/issues/og.png"
  },
  "/__og-image__/static/guides/deployment/digitalocean/og.png": {
    "type": "image/png",
    "etag": "\"4d2d8-tkvwf6LA87SpIVTuA7kuiRNbyQ4\"",
    "mtime": "2025-08-25T09:22:06.012Z",
    "size": 316120,
    "path": "../public/__og-image__/static/guides/deployment/digitalocean/og.png"
  },
  "/__og-image__/static/guides/deployment/docker/og.png": {
    "type": "image/png",
    "etag": "\"4c24c-P0AIG5+K0plaf4v0FZu+Ody4bqI\"",
    "mtime": "2025-08-25T09:22:10.756Z",
    "size": 311884,
    "path": "../public/__og-image__/static/guides/deployment/docker/og.png"
  },
  "/__og-image__/static/guides/deployment/postgresql-guide/og.png": {
    "type": "image/png",
    "etag": "\"4eb75-mAY3L6Rcv47dQhGP431cOjlcDDI\"",
    "mtime": "2025-08-25T09:22:09.084Z",
    "size": 322421,
    "path": "../public/__og-image__/static/guides/deployment/postgresql-guide/og.png"
  },
  "/__og-image__/static/guides/os/linux/og.png": {
    "type": "image/png",
    "etag": "\"4cd55-JfQKG0s8P/hakM0DvSJCg+n0IwE\"",
    "mtime": "2025-08-25T09:22:07.732Z",
    "size": 314709,
    "path": "../public/__og-image__/static/guides/os/linux/og.png"
  },
  "/__og-image__/static/guides/os/macos/og.png": {
    "type": "image/png",
    "etag": "\"4c09b-GSr2tMsweM8PlV/qpBAAj8GE0OY\"",
    "mtime": "2025-08-25T09:22:07.759Z",
    "size": 311451,
    "path": "../public/__og-image__/static/guides/os/macos/og.png"
  },
  "/__og-image__/static/guides/platforms/dingtalk/og.png": {
    "type": "image/png",
    "etag": "\"4d047-FSj83W2SkWPhHjvt+zrEXgwwF8g\"",
    "mtime": "2025-08-25T09:22:09.084Z",
    "size": 315463,
    "path": "../public/__og-image__/static/guides/platforms/dingtalk/og.png"
  },
  "/__og-image__/static/guides/platforms/gitlab-ci/og.png": {
    "type": "image/png",
    "etag": "\"52d4b-wJOvSswlBulCv6rux29Zh1W0LCg\"",
    "mtime": "2025-08-25T09:22:09.112Z",
    "size": 339275,
    "path": "../public/__og-image__/static/guides/platforms/gitlab-ci/og.png"
  },
  "/__og-image__/static/guides/platforms/iserver/og.png": {
    "type": "image/png",
    "etag": "\"4e7e9-6qkedqVGy1gNVpT+zxGnIXGZSeg\"",
    "mtime": "2025-08-25T09:22:11.440Z",
    "size": 321513,
    "path": "../public/__og-image__/static/guides/platforms/iserver/og.png"
  },
  "/__og-image__/static/guides/runtime/node/og.png": {
    "type": "image/png",
    "etag": "\"4bf11-q+yUuU6mrrOlxRX7TiSAq8th7W4\"",
    "mtime": "2025-08-25T09:22:09.086Z",
    "size": 311057,
    "path": "../public/__og-image__/static/guides/runtime/node/og.png"
  },
  "/__og-image__/static/tools/editors/idea/og.png": {
    "type": "image/png",
    "etag": "\"4ef9a-cdHQUJ3/ItSrTfL4swyoWp+PNbg\"",
    "mtime": "2025-08-25T09:22:05.958Z",
    "size": 323482,
    "path": "../public/__og-image__/static/tools/editors/idea/og.png"
  },
  "/__og-image__/static/tools/editors/vscode/og.png": {
    "type": "image/png",
    "etag": "\"4c9eb-RVhCvCQrfq1jnNx3vds2w7hhhh8\"",
    "mtime": "2025-08-25T09:22:04.675Z",
    "size": 313835,
    "path": "../public/__og-image__/static/tools/editors/vscode/og.png"
  },
  "/__og-image__/static/tools/package-managers/homebrew/og.png": {
    "type": "image/png",
    "etag": "\"4cb6d-OwOrujtV1rryMPXmwrJkkBlTdmg\"",
    "mtime": "2025-08-25T09:22:04.577Z",
    "size": 314221,
    "path": "../public/__og-image__/static/tools/package-managers/homebrew/og.png"
  },
  "/__og-image__/static/tools/package-managers/pnpm/og.png": {
    "type": "image/png",
    "etag": "\"4ba64-m3bL3CmBdS7K0E8Xg813cikzS5k\"",
    "mtime": "2025-08-25T09:22:04.278Z",
    "size": 309860,
    "path": "../public/__og-image__/static/tools/package-managers/pnpm/og.png"
  },
  "/__og-image__/static/tools/version-control/fnm/og.png": {
    "type": "image/png",
    "etag": "\"4ba97-DH97hN/8eo1vkIJy9yYih/MhUJ0\"",
    "mtime": "2025-08-25T09:22:04.577Z",
    "size": 309911,
    "path": "../public/__og-image__/static/tools/version-control/fnm/og.png"
  },
  "/__og-image__/static/tools/version-control/git/og.png": {
    "type": "image/png",
    "etag": "\"4b7f6-76pb6Mv2JEOxkh2D1oezv1eMwf4\"",
    "mtime": "2025-08-25T09:22:05.470Z",
    "size": 309238,
    "path": "../public/__og-image__/static/tools/version-control/git/og.png"
  },
  "/_ipx/_/images/ecosystem/nuxt/og-image.png": {
    "type": "image/png",
    "etag": "\"3520e-FNEMhKcnSav2F9Coi+R26cjNyy4\"",
    "mtime": "2025-08-25T09:22:18.207Z",
    "size": 217614,
    "path": "../public/_ipx/_/images/ecosystem/nuxt/og-image.png"
  },
  "/_ipx/_/images/ecosystem/nuxt/sitemap.png": {
    "type": "image/png",
    "etag": "\"4dfda-JsIlO0Cu0r61c5/Dt6g4yr1pzxM\"",
    "mtime": "2025-08-25T09:22:20.030Z",
    "size": 319450,
    "path": "../public/_ipx/_/images/ecosystem/nuxt/sitemap.png"
  },
  "/_ipx/_/images/ecosystem/nuxt/verify-pm2.png": {
    "type": "image/png",
    "etag": "\"1f3390-fF2gRKi0M5waF/MzEl9kldNi++8\"",
    "mtime": "2025-08-25T09:22:20.324Z",
    "size": 2044816,
    "path": "../public/_ipx/_/images/ecosystem/nuxt/verify-pm2.png"
  },
  "/_ipx/_/images/guides/deployment/digitalocean/create-droplets-config.png": {
    "type": "image/png",
    "etag": "\"b712d-5tgTFZ2LLrOhz8rFVS03C8zH1pA\"",
    "mtime": "2025-08-25T09:22:05.988Z",
    "size": 749869,
    "path": "../public/_ipx/_/images/guides/deployment/digitalocean/create-droplets-config.png"
  },
  "/_ipx/_/images/guides/deployment/digitalocean/create-entry.png": {
    "type": "image/png",
    "etag": "\"85634-jopXRPFZtbB4zogpk+4VOU75rAI\"",
    "mtime": "2025-08-25T09:22:06.000Z",
    "size": 546356,
    "path": "../public/_ipx/_/images/guides/deployment/digitalocean/create-entry.png"
  },
  "/_ipx/_/images/guides/deployment/digitalocean/droplets-dashboard.png": {
    "type": "image/png",
    "etag": "\"3142f-BhTRSySxvCduiA+jnsADjGeBukw\"",
    "mtime": "2025-08-25T09:22:05.959Z",
    "size": 201775,
    "path": "../public/_ipx/_/images/guides/deployment/digitalocean/droplets-dashboard.png"
  },
  "/_ipx/_/images/guides/deployment/docker/cloudflare-a-record.png": {
    "type": "image/png",
    "etag": "\"52548-uqjt/FSkbYHDza3tEb/yw59jWSM\"",
    "mtime": "2025-08-25T09:22:10.411Z",
    "size": 337224,
    "path": "../public/_ipx/_/images/guides/deployment/docker/cloudflare-a-record.png"
  },
  "/_ipx/_/images/guides/deployment/docker/cloudflare-create-certificate.png": {
    "type": "image/png",
    "etag": "\"51b2c-Cfr7Ss7nWaLhbQBZMEgqzdDkJA0\"",
    "mtime": "2025-08-25T09:22:10.411Z",
    "size": 334636,
    "path": "../public/_ipx/_/images/guides/deployment/docker/cloudflare-create-certificate.png"
  },
  "/_ipx/_/images/guides/deployment/docker/docker-compose-result.png": {
    "type": "image/png",
    "etag": "\"2fc52-bvBQxi5yNSRSPcswOi3Z/p77vH4\"",
    "mtime": "2025-08-25T09:22:10.410Z",
    "size": 195666,
    "path": "../public/_ipx/_/images/guides/deployment/docker/docker-compose-result.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2-default.png": {
    "type": "image/png",
    "etag": "\"1be08-VoWSJBjRu6t/Q5pMavwxjGxiOyg\"",
    "mtime": "2025-08-25T09:22:07.732Z",
    "size": 114184,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2-default.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2-import.png": {
    "type": "image/png",
    "etag": "\"4e31f-2hKHo96JpmQJ9YUynlXIiLR4Krw\"",
    "mtime": "2025-08-25T09:22:07.732Z",
    "size": 320287,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2-import.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2-status-active.png": {
    "type": "image/png",
    "etag": "\"32448-eWiEvsw+jDxhIToAOpr6dPe9ve0\"",
    "mtime": "2025-08-25T09:22:07.741Z",
    "size": 205896,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2-status-active.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2-status.png": {
    "type": "image/png",
    "etag": "\"40f1d-2tK0ymsrrSAAeILbc+PS0Bh596Q\"",
    "mtime": "2025-08-25T09:22:07.741Z",
    "size": 266013,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2-status.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2-theme.png": {
    "type": "image/png",
    "etag": "\"5d045-TMPmcp2d4vctVmV71PsiWlSyEFU\"",
    "mtime": "2025-08-25T09:22:07.741Z",
    "size": 380997,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2-theme.png"
  },
  "/_ipx/_/images/guides/os/macos/iterm2.png": {
    "type": "image/png",
    "etag": "\"1a59b-WWhmpYYutwCZutpdxcHe4/q4IbE\"",
    "mtime": "2025-08-25T09:22:07.465Z",
    "size": 107931,
    "path": "../public/_ipx/_/images/guides/os/macos/iterm2.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/build-deploy-workflow.png": {
    "type": "image/png",
    "etag": "\"117cf-SZ2LzcYuT0QxtwWbPfkPxY5MBxA\"",
    "mtime": "2025-08-25T09:22:09.086Z",
    "size": 71631,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/build-deploy-workflow.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/ci-start-notify.png": {
    "type": "image/png",
    "etag": "\"b8bd-b67D3VpDO2NtTmniR8QR/lyuU2o\"",
    "mtime": "2025-08-25T09:22:09.086Z",
    "size": 47293,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/ci-start-notify.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png": {
    "type": "image/png",
    "etag": "\"f005-OcTg8KnlsfNaneP56ACVOQgMEvc\"",
    "mtime": "2025-08-25T09:22:09.770Z",
    "size": 61445,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/manual-run-pipeline.png": {
    "type": "image/png",
    "etag": "\"3b6e7-M5W3ZXSvXO4ixJmJ4QfkQAFnm+Q\"",
    "mtime": "2025-08-25T09:22:10.411Z",
    "size": 243431,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/manual-run-pipeline.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-start.png": {
    "type": "image/png",
    "etag": "\"4f9a-zUEWvewZG2BuPtGVzq/Sgi0x6w4\"",
    "mtime": "2025-08-25T09:22:09.043Z",
    "size": 20378,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-start.png"
  },
  "/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-workflow.png": {
    "type": "image/png",
    "etag": "\"eab8-y7Kk9D0R2ls3ILYi5fSRaK+Lryg\"",
    "mtime": "2025-08-25T09:22:09.083Z",
    "size": 60088,
    "path": "../public/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-workflow.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/dataInterface.png": {
    "type": "image/png",
    "etag": "\"2225d-wj/D42l4S4D/AUTq59Sr31E/Nak\"",
    "mtime": "2025-08-25T09:22:11.122Z",
    "size": 139869,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/dataInterface.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/geojson.png": {
    "type": "image/png",
    "etag": "\"9eeb-CSiR4N3CwO9i2xeTZJ8eXFkWGMA\"",
    "mtime": "2025-08-25T09:22:11.469Z",
    "size": 40683,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/geojson.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/mapInterface.png": {
    "type": "image/png",
    "etag": "\"26154-7PoiKMSASi/gHKM19RSMtliO9kU\"",
    "mtime": "2025-08-25T09:22:11.405Z",
    "size": 155988,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/mapInterface.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/releaseError.png": {
    "type": "image/png",
    "etag": "\"9e83-UN1w3aeZlizfANKzWrOEEvaBnws\"",
    "mtime": "2025-08-25T09:22:11.488Z",
    "size": 40579,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/releaseError.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/sldBody.png": {
    "type": "image/png",
    "etag": "\"1cd8c-5M/07f1COvihe6845evB9mAiT44\"",
    "mtime": "2025-08-25T09:22:11.429Z",
    "size": 118156,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/sldBody.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/sldBodyReply.png": {
    "type": "image/png",
    "etag": "\"33894-GFdxkuf3kRRZRIJzbsi0FPlZGyo\"",
    "mtime": "2025-08-25T09:22:11.595Z",
    "size": 211092,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/sldBodyReply.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/wfsError1.png": {
    "type": "image/png",
    "etag": "\"16a7a-SFPHRzJ+EyBgo+orjjNzpyVkrg0\"",
    "mtime": "2025-08-25T09:22:11.595Z",
    "size": 92794,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/wfsError1.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/wfsError2.png": {
    "type": "image/png",
    "etag": "\"12860-MORDTMg/p5jz1uNS9B8z0pfHOKI\"",
    "mtime": "2025-08-25T09:22:11.591Z",
    "size": 75872,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/wfsError2.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/wfsError3.png": {
    "type": "image/png",
    "etag": "\"53bad-WnDOXlYSCL9SdKSqwSBci779Q7E\"",
    "mtime": "2025-08-25T09:22:11.607Z",
    "size": 342957,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/wfsError3.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/wfsError4.png": {
    "type": "image/png",
    "etag": "\"150ac-vsyU+kJoYIs8Kj/S4sLyPre9ErU\"",
    "mtime": "2025-08-25T09:22:11.606Z",
    "size": 86188,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/wfsError4.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/wms130.png": {
    "type": "image/png",
    "etag": "\"5954b-teBhgc7ltgi1Qb3CW33ecbv4afA\"",
    "mtime": "2025-08-25T09:22:11.137Z",
    "size": 365899,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/wms130.png"
  },
  "/_ipx/_/images/guides/platforms/iserver/zxyTileImage.png": {
    "type": "image/png",
    "etag": "\"5407d-PttkYPTXhkNrSeVuSFvqdiBiq/U\"",
    "mtime": "2025-08-25T09:22:11.137Z",
    "size": 344189,
    "path": "../public/_ipx/_/images/guides/platforms/iserver/zxyTileImage.png"
  },
  "/_ipx/_/images/tools/editors/idea/copyright.png": {
    "type": "image/png",
    "etag": "\"334dd-kj4hx2zYt33Fxr6RcHrnQJ4q6uA\"",
    "mtime": "2025-08-25T09:22:05.474Z",
    "size": 210141,
    "path": "../public/_ipx/_/images/tools/editors/idea/copyright.png"
  },
  "/_ipx/_/images/tools/editors/vscode/add-vscode-action.png": {
    "type": "image/png",
    "etag": "\"50d11-FSOlKTkzOXddLtytRfSuBplrLcE\"",
    "mtime": "2025-08-25T09:22:04.739Z",
    "size": 331025,
    "path": "../public/_ipx/_/images/tools/editors/vscode/add-vscode-action.png"
  },
  "/_ipx/_/images/tools/editors/vscode/git-prune.png": {
    "type": "image/png",
    "etag": "\"e8c8-/hUflL2PncIBOhQwk2GuAlfy8Lc\"",
    "mtime": "2025-08-25T09:22:04.616Z",
    "size": 59592,
    "path": "../public/_ipx/_/images/tools/editors/vscode/git-prune.png"
  },
  "/_ipx/_/images/tools/editors/vscode/git-vscode-gpg.png": {
    "type": "image/png",
    "etag": "\"442e-BfuF3vWm/yZKdWM3MJylp2vO7jw\"",
    "mtime": "2025-08-25T09:22:05.101Z",
    "size": 17454,
    "path": "../public/_ipx/_/images/tools/editors/vscode/git-vscode-gpg.png"
  },
  "/_ipx/_/images/tools/editors/vscode/gitlens-commit-message.png": {
    "type": "image/png",
    "etag": "\"48fe3-EMnJTdIzIk2E+TXEueBcNAcQm7I\"",
    "mtime": "2025-08-25T09:22:04.738Z",
    "size": 298979,
    "path": "../public/_ipx/_/images/tools/editors/vscode/gitlens-commit-message.png"
  },
  "/_ipx/_/images/tools/editors/vscode/quick-operating.png": {
    "type": "image/png",
    "etag": "\"3b87f-wDOvWc3+XI/+62Fv7054Z+YRt7c\"",
    "mtime": "2025-08-25T09:22:04.738Z",
    "size": 243839,
    "path": "../public/_ipx/_/images/tools/editors/vscode/quick-operating.png"
  },
  "/_ipx/_/images/tools/editors/vscode/service-config.png": {
    "type": "image/png",
    "etag": "\"96e65-ySrEsvrrgVqrH2J73yxkioGBzEg\"",
    "mtime": "2025-08-25T09:22:04.750Z",
    "size": 618085,
    "path": "../public/_ipx/_/images/tools/editors/vscode/service-config.png"
  },
  "/_ipx/_/images/tools/editors/vscode/use-service.png": {
    "type": "image/png",
    "etag": "\"19ece-OMoX5s4S1zLCJBPV521wc/rULlg\"",
    "mtime": "2025-08-25T09:22:04.737Z",
    "size": 106190,
    "path": "../public/_ipx/_/images/tools/editors/vscode/use-service.png"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$1 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_fonts/":{"maxAge":31536000},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _innDqy = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _j88xv_ = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = useNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: -4,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: 0,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    // @ts-expect-error untyped
    ...envSiteConfig(globalThis._importMeta_.env)
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host;
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

const _VNFb0_ = defineEventHandler(async (e) => {
  const nitroApp = useNitroApp();
  const { indexable} = getSiteRobotConfig(e);
  const { credits, isNuxtContentV2, cacheControl } = useRuntimeConfigNuxtRobots(e);
  let robotsTxtCtx = {
    sitemaps: [],
    groups: [
      {
        allow: [],
        comment: [],
        userAgent: ["*"],
        disallow: ["/"]
      }
    ]
  };
  if (indexable) {
    robotsTxtCtx = await resolveRobotsTxtContext(e);
    robotsTxtCtx.sitemaps = [...new Set(
      asArray(robotsTxtCtx.sitemaps).map((s) => !s.startsWith("http") ? withSiteUrl(e, s, { withBase: true}) : s)
    )];
    if (isNuxtContentV2) {
      const contentWithRobotRules = await e.$fetch("/__robots__/nuxt-content.json", {
        headers: {
          Accept: "application/json"
        }
      });
      if (String(contentWithRobotRules).trim().startsWith("<!DOCTYPE")) {
        logger$2.error("Invalid HTML returned from /__robots__/nuxt-content.json, skipping.");
      } else {
        for (const group of robotsTxtCtx.groups) {
          if (group.userAgent.includes("*")) {
            group.disallow.push(...contentWithRobotRules);
            group.disallow = group.disallow.filter(Boolean);
          }
        }
      }
    }
  }
  let robotsTxt = generateRobotsTxt(robotsTxtCtx);
  if (credits) {
    robotsTxt = [
      `# START nuxt-robots (${indexable ? "indexable" : "indexing disabled"})`,
      robotsTxt,
      "# END nuxt-robots"
    ].filter(Boolean).join("\n");
  }
  setHeader(e, "Content-Type", "text/plain; charset=utf-8");
  setHeader(e, "Cache-Control", globalThis._importMeta_.test || !cacheControl ? "no-store" : cacheControl);
  const hookCtx = { robotsTxt, e };
  await nitroApp.hooks.callHook("robots:robots-txt", hookCtx);
  return hookCtx.robotsTxt;
});

const _wSc17j = defineEventHandler(async (e) => {
  if (e.path === "/robots.txt" || e.path.startsWith("/__") || e.path.startsWith("/api") || e.path.startsWith("/_nuxt"))
    return;
  const nuxtRobotsConfig = useRuntimeConfigNuxtRobots(e);
  if (nuxtRobotsConfig) {
    const { header } = nuxtRobotsConfig;
    const robotConfig = getPathRobotConfig(e, { skipSiteIndexable: Boolean(getQuery(e)?.mockProductionEnv) });
    if (header) {
      setHeader(e, "X-Robots-Tag", robotConfig.rule);
    }
    e.context.robots = robotConfig;
  }
});

const _JzGfm0 = defineEventHandler(async (e) => {
  const collections = [];
  for (const collection in contentManifest) {
    if (contentManifest[collection].fields.sitemap) {
      collections.push(collection);
    }
  }
  const contentList = [];
  for (const collection of collections) {
    contentList.push(
      queryCollection(e, collection).select("path", "sitemap").where("path", "IS NOT NULL").where("sitemap", "IS NOT NULL").all()
    );
  }
  const results = await Promise.all(contentList);
  return results.flatMap((c) => {
    return c.filter((c2) => c2.sitemap !== false && c2.path).flatMap((c2) => ({
      loc: c2.path,
      ...c2.sitemap || {}
    }));
  }).filter(Boolean);
});

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  return result.slice(0, resultLength);
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}) {
  const urlFilter = createFilter(options);
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    return urlFilter(path);
  };
}
function createFilter(options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];
  if (include.length === 0 && exclude.length === 0)
    return () => true;
  return function(path) {
    for (const v of [{ rules: exclude, result: false }, { rules: include, result: true }]) {
      const regexRules = v.rules.filter((r) => r instanceof RegExp);
      if (regexRules.some((r) => r.test(path)))
        return v.result;
      const stringRules = v.rules.filter((r) => typeof r === "string");
      if (stringRules.length > 0) {
        const routes = {};
        for (const r of stringRules) {
          if (r === path)
            return v.result;
          routes[r] = true;
        }
        const routeRulesMatcher = toRouteMatcher(createRouter$1({ routes, strictTrailingSlash: false }));
        if (routeRulesMatcher.matchAll(path).length > 0)
          return Boolean(v.result);
      }
    }
    return include.length === 0;
  };
}

function xmlEscape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(useRuntimeConfig(e).sitemap));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  return Object.freeze(clone);
}

const _Zo8bT5 = defineEventHandler(async (e) => {
  const fixPath = createSitePathResolver(e, { absolute: false, withBase: true });
  const { sitemapName: fallbackSitemapName, cacheMaxAgeSeconds, version, xslColumns, xslTips } = useSitemapRuntimeConfig();
  setHeader(e, "Content-Type", "application/xslt+xml");
  if (cacheMaxAgeSeconds)
    setHeader(e, "Cache-Control", `public, max-age=${cacheMaxAgeSeconds}, must-revalidate`);
  else
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  const { name: siteName, url: siteUrl } = useSiteConfig(e);
  const referrer = getHeader(e, "Referer") || "/";
  const referrerPath = parseURL(referrer).pathname;
  const isNotIndexButHasIndex = referrerPath !== "/sitemap.xml" && referrerPath !== "/sitemap_index.xml" && referrerPath.endsWith(".xml");
  const sitemapName = parseURL(referrer).pathname.split("/").pop()?.split("-sitemap")[0] || fallbackSitemapName;
  const title = `${siteName}${sitemapName !== "sitemap.xml" ? ` - ${sitemapName === "sitemap_index.xml" ? "index" : sitemapName}` : ""}`.replace(/&/g, "&amp;");
  const canonicalQuery = getQuery$1(referrer).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const conditionalTips = [
    'You are looking at a <a href="https://developer.mozilla.org/en-US/docs/Web/XSLT/Transforming_XML_with_XSLT/An_Overview" style="color: #398465" target="_blank">XML stylesheet</a>. Read the <a href="https://nuxtseo.com/sitemap/guides/customising-ui" style="color: #398465" target="_blank">docs</a> to learn how to customize it. View the page source to see the raw XML.',
    `URLs missing? Check Nuxt Devtools Sitemap tab (or the <a href="${xmlEscape(withQuery("/__sitemap__/debug.json", { sitemap: sitemapName }))}" style="color: #398465" target="_blank">debug endpoint</a>).`
  ];
  const fetchErrors = [];
  const xslQuery = getQuery(e);
  if (xslQuery.error_messages) {
    const errorMessages = xslQuery.error_messages;
    const errorUrls = xslQuery.error_urls;
    if (errorMessages) {
      const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
      const urls = Array.isArray(errorUrls) ? errorUrls : errorUrls ? [errorUrls] : [];
      messages.forEach((msg, i) => {
        const errorParts = [xmlEscape(msg)];
        if (urls[i]) {
          errorParts.push(xmlEscape(urls[i]));
        }
        fetchErrors.push(`<strong style="color: #dc2626;">Error ${i + 1}:</strong> ${errorParts.join(" - ")}`);
      });
    }
  }
  if (!isShowingCanonical) {
    const canonicalPreviewUrl = withQuery(referrer, { canonical: "" });
    conditionalTips.push(`Your canonical site URL is <strong>${xmlEscape(siteUrl)}</strong>.`);
    conditionalTips.push(`You can preview your canonical sitemap by visiting <a href="${xmlEscape(canonicalPreviewUrl)}" style="color: #398465; white-space: nowrap;">${xmlEscape(fixPath(canonicalPreviewUrl))}?canonical</a>`);
  } else {
    conditionalTips.push(`You are viewing the canonical sitemap. You can switch to using the request origin: <a href="${xmlEscape(fixPath(referrer))}" style="color: #398465; white-space: nowrap ">${xmlEscape(fixPath(referrer))}</a>`);
  }
  const hasRuntimeErrors = fetchErrors.length > 0;
  const showSidebar = hasRuntimeErrors;
  const runtimeErrors = hasRuntimeErrors ? fetchErrors.map((t) => `<li><p>${t}</p></li>`).join("\n") : "";
  let columns = [...xslColumns];
  if (!columns.length) {
    columns = [
      { label: "URL", width: "50%" },
      { label: "Images", width: "25%", select: "count(image:image)" },
      { label: "Last Updated", width: "25%", select: "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))" }
    ];
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body {
            font-family: Inter, Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333;
          }

          table {
            border: none;
            border-collapse: collapse;
          }

          .bg-yellow-200 {
            background-color: #fef9c3;
          }

          .p-5 {
            padding: 1.25rem;
          }

          .rounded {
            border-radius: 4px;
            }

          .shadow {
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          #sitemap tr:nth-child(odd) td {
            background-color: #f8f8f8 !important;
          }

          #sitemap tbody tr:hover td {
            background-color: #fff;
          }

          #sitemap tbody tr:hover td, #sitemap tbody tr:hover td a {
            color: #000;
          }

          .expl a {
            color: #398465;
            font-weight: 600;
          }

          .expl a:visited {
            color: #398465;
          }

          a {
            color: #000;
            text-decoration: none;
          }

          a:visited {
            color: #777;
          }

          a:hover {
            text-decoration: underline;
          }

          td {
            font-size: 12px;
          }

          .text-2xl {
            font-size: 2rem;
            font-weight: 600;
            line-height: 1.25;
          }

          th {
            text-align: left;
            padding-right: 30px;
            font-size: 12px;
          }

          thead th {
            border-bottom: 1px solid #000;
          }
          .fixed { position: fixed; }
          .right-2 { right: 2rem; }
          .top-2 { top: 2rem; }
          .w-30 { width: 30rem; }
          p { margin: 0; }
          li { padding-bottom: 0.5rem; line-height: 1.5; }
          h1 { margin: 0; }
          .mb-5 { margin-bottom: 1.25rem; }
          .mb-3 { margin-bottom: 0.75rem; }
        </style>
      </head>
      <body>
        <div style="grid-template-columns: 1fr 1fr; display: grid; margin: 3rem;">
            <div>
             <div id="content">
          <h1 class="text-2xl mb-3">XML Sitemap</h1>
          <h2>${xmlEscape(title)}</h2>
          ${isNotIndexButHasIndex ? `<p style="font-size: 12px; margin-bottom: 1rem;"><a href="${xmlEscape(fixPath("/sitemap_index.xml"))}">${xmlEscape(fixPath("/sitemap_index.xml"))}</a></p>` : ""}
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <p class="expl" style="margin-bottom: 1rem;">
              This XML Sitemap Index file contains
              <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps.
            </p>
            <table id="sitemap" cellpadding="3">
              <thead>
                <tr>
                  <th width="75%">Sitemap</th>
                  <th width="25%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <xsl:variable name="sitemapURL">
                    <xsl:value-of select="sitemap:loc"/>
                  </xsl:variable>
                  <tr>
                    <td>
                      <a href="{$sitemapURL}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:value-of
                        select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
            <p class="expl" style="margin-bottom: 1rem;">
              This XML Sitemap contains
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.
            </p>
            <table id="sitemap" cellpadding="3">
              <thead>
                <tr>
                  ${columns.map((c) => `<th width="${c.width}">${c.label}</th>`).join("\n")}
                </tr>
              </thead>
              <tbody>
                <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
                <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <xsl:variable name="itemURL">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:variable>
                      <a href="{$itemURL}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    ${columns.filter((c) => c.label !== "URL").map((c) => `<td>
<xsl:value-of select="${c.select}"/>
</td>`).join("\n")}
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
        </div>
                    ${showSidebar ? `<div class="w-30 top-2 shadow rounded p-5 right-2" style="margin: 0 auto;">
                      ${""}
                      ${hasRuntimeErrors ? `<div${""}><p><strong style="color: #dc2626;">Runtime Errors</strong></p><ul style="margin: 1rem 0; padding: 0;">${runtimeErrors}</ul></div>` : ""}
                      ${""}
                    </div>` : ""}
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
});

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [path === "/" ? path : withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    const pathWithoutQuery = withoutQuery(path);
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(pathWithoutQuery === "/" ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL)
    ).reverse());
  };
}

function resolve(s, resolvers) {
  if (typeof s === "undefined" || !resolvers)
    return s;
  s = typeof s === "string" ? s : s.toString();
  if (hasProtocol(s, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(s);
  return resolvers.canonicalUrlResolver(s);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const e = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (e.url && !e.loc) {
    e.loc = e.url;
    delete e.url;
  }
  if (typeof e.loc !== "string") {
    e.loc = "";
  }
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch (e2) {
    e2._path = null;
  }
  if (e._path) {
    const query = parseQuery(e._path.search);
    const qs = stringifyQuery(query);
    e._relativeLoc = `${encodePath(e._path?.pathname)}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu(_e, defaults);
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (let i = 0; i < alternatives.length; i++) {
      const alt = alternatives[i];
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (let i = 0; i < images.length; i++) {
      images[i].loc = resolve(images[i].loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].content_loc) {
        videos[i].content_loc = resolve(videos[i].content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    if (d.includes("T")) {
      const t = d.split("T")[1];
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title)) missingFields.push("title");
      if (!isValidString(video.thumbnail_loc)) missingFields.push("thumbnail_loc");
      if (!isValidString(video.description)) missingFields.push("description");
      if (!isValidString(video.content_loc)) missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  const filteredUrlObj = Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
  return filteredUrlObj;
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
function globalSitemapSources() {
  return import('../virtual/global-sources.mjs').then((m) => m.sources);
}
function childSitemapSources(definition) {
  return definition?._hasSourceChunk ? import('../virtual/child-sources.mjs').then((m) => m.sources[definition.sitemapName] || []) : Promise.resolve([]);
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      if (typeof source === "object" && "urls" in source) {
        return {
          timeTakenMs: 0,
          ...source,
          urls: source.urls
        };
      }
      if (source.fetch)
        return fetchDataSource(source, event);
      return {
        ...source,
        error: "Invalid source"
      };
    })
  )).flat();
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize = 1e3) {
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url) {
  const capacity = 50;
  const parts = Array.from({ length: capacity });
  let partIndex = 0;
  parts[partIndex++] = "    <url>";
  if (url.loc) {
    parts[partIndex++] = `        <loc>${escapeValueForXml(url.loc)}</loc>`;
  }
  if (url.lastmod) {
    parts[partIndex++] = `        <lastmod>${url.lastmod}</lastmod>`;
  }
  if (url.changefreq) {
    parts[partIndex++] = `        <changefreq>${url.changefreq}</changefreq>`;
  }
  if (url.priority !== void 0) {
    const priorityValue = Number.parseFloat(String(url.priority));
    const formattedPriority = priorityValue % 1 === 0 ? String(priorityValue) : priorityValue.toFixed(1);
    parts[partIndex++] = `        <priority>${formattedPriority}</priority>`;
  }
  const keys = Object.keys(url).filter((k) => !k.startsWith("_") && !["loc", "lastmod", "changefreq", "priority"].includes(k));
  for (const key of keys) {
    const value = url[key];
    if (value === void 0 || value === null) continue;
    switch (key) {
      case "alternatives":
        if (Array.isArray(value) && value.length > 0) {
          for (const alt of value) {
            const attrs = Object.entries(alt).map(([k, v]) => `${k}="${escapeValueForXml(v)}"`).join(" ");
            parts[partIndex++] = `        <xhtml:link rel="alternate" ${attrs} />`;
          }
        }
        break;
      case "images":
        if (Array.isArray(value) && value.length > 0) {
          for (const img of value) {
            parts[partIndex++] = "        <image:image>";
            parts[partIndex++] = `            <image:loc>${escapeValueForXml(img.loc)}</image:loc>`;
            if (img.title) parts[partIndex++] = `            <image:title>${escapeValueForXml(img.title)}</image:title>`;
            if (img.caption) parts[partIndex++] = `            <image:caption>${escapeValueForXml(img.caption)}</image:caption>`;
            if (img.geo_location) parts[partIndex++] = `            <image:geo_location>${escapeValueForXml(img.geo_location)}</image:geo_location>`;
            if (img.license) parts[partIndex++] = `            <image:license>${escapeValueForXml(img.license)}</image:license>`;
            parts[partIndex++] = "        </image:image>";
          }
        }
        break;
      case "videos":
        if (Array.isArray(value) && value.length > 0) {
          for (const video of value) {
            parts[partIndex++] = "        <video:video>";
            parts[partIndex++] = `            <video:title>${escapeValueForXml(video.title)}</video:title>`;
            if (video.thumbnail_loc) {
              parts[partIndex++] = `            <video:thumbnail_loc>${escapeValueForXml(video.thumbnail_loc)}</video:thumbnail_loc>`;
            }
            parts[partIndex++] = `            <video:description>${escapeValueForXml(video.description)}</video:description>`;
            if (video.content_loc) {
              parts[partIndex++] = `            <video:content_loc>${escapeValueForXml(video.content_loc)}</video:content_loc>`;
            }
            if (video.player_loc) {
              const attrs = video.player_loc.allow_embed ? ' allow_embed="yes"' : "";
              const autoplay = video.player_loc.autoplay ? ' autoplay="yes"' : "";
              parts[partIndex++] = `            <video:player_loc${attrs}${autoplay}>${escapeValueForXml(video.player_loc)}</video:player_loc>`;
            }
            if (video.duration !== void 0) {
              parts[partIndex++] = `            <video:duration>${video.duration}</video:duration>`;
            }
            if (video.expiration_date) {
              parts[partIndex++] = `            <video:expiration_date>${video.expiration_date}</video:expiration_date>`;
            }
            if (video.rating !== void 0) {
              parts[partIndex++] = `            <video:rating>${video.rating}</video:rating>`;
            }
            if (video.view_count !== void 0) {
              parts[partIndex++] = `            <video:view_count>${video.view_count}</video:view_count>`;
            }
            if (video.publication_date) {
              parts[partIndex++] = `            <video:publication_date>${video.publication_date}</video:publication_date>`;
            }
            if (video.family_friendly !== void 0) {
              parts[partIndex++] = `            <video:family_friendly>${video.family_friendly === "yes" || video.family_friendly === true ? "yes" : "no"}</video:family_friendly>`;
            }
            if (video.restriction) {
              const relationship = video.restriction.relationship || "allow";
              parts[partIndex++] = `            <video:restriction relationship="${relationship}">${escapeValueForXml(video.restriction.restriction)}</video:restriction>`;
            }
            if (video.platform) {
              const relationship = video.platform.relationship || "allow";
              parts[partIndex++] = `            <video:platform relationship="${relationship}">${escapeValueForXml(video.platform.platform)}</video:platform>`;
            }
            if (video.requires_subscription !== void 0) {
              parts[partIndex++] = `            <video:requires_subscription>${video.requires_subscription === "yes" || video.requires_subscription === true ? "yes" : "no"}</video:requires_subscription>`;
            }
            if (video.price) {
              const prices = Array.isArray(video.price) ? video.price : [video.price];
              for (const price of prices) {
                const attrs = [];
                if (price.currency) attrs.push(`currency="${price.currency}"`);
                if (price.type) attrs.push(`type="${price.type}"`);
                const attrsStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
                parts[partIndex++] = `            <video:price${attrsStr}>${escapeValueForXml(price.price)}</video:price>`;
              }
            }
            if (video.uploader) {
              const info = video.uploader.info ? ` info="${escapeValueForXml(video.uploader.info)}"` : "";
              parts[partIndex++] = `            <video:uploader${info}>${escapeValueForXml(video.uploader.uploader)}</video:uploader>`;
            }
            if (video.live !== void 0) {
              parts[partIndex++] = `            <video:live>${video.live === "yes" || video.live === true ? "yes" : "no"}</video:live>`;
            }
            if (video.tag) {
              const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
              for (const tag of tags) {
                parts[partIndex++] = `            <video:tag>${escapeValueForXml(tag)}</video:tag>`;
              }
            }
            if (video.category) {
              parts[partIndex++] = `            <video:category>${escapeValueForXml(video.category)}</video:category>`;
            }
            if (video.gallery_loc) {
              const title = video.gallery_loc.title ? ` title="${escapeValueForXml(video.gallery_loc.title)}"` : "";
              parts[partIndex++] = `            <video:gallery_loc${title}>${escapeValueForXml(video.gallery_loc)}</video:gallery_loc>`;
            }
            parts[partIndex++] = "        </video:video>";
          }
        }
        break;
      case "news":
        if (value) {
          parts[partIndex++] = "        <news:news>";
          parts[partIndex++] = "            <news:publication>";
          parts[partIndex++] = `                <news:name>${escapeValueForXml(value.publication.name)}</news:name>`;
          parts[partIndex++] = `                <news:language>${escapeValueForXml(value.publication.language)}</news:language>`;
          parts[partIndex++] = "            </news:publication>";
          if (value.title) {
            parts[partIndex++] = `            <news:title>${escapeValueForXml(value.title)}</news:title>`;
          }
          if (value.publication_date) {
            parts[partIndex++] = `            <news:publication_date>${value.publication_date}</news:publication_date>`;
          }
          if (value.access) {
            parts[partIndex++] = `            <news:access>${value.access}</news:access>`;
          }
          if (value.genres) {
            parts[partIndex++] = `            <news:genres>${escapeValueForXml(value.genres)}</news:genres>`;
          }
          if (value.keywords) {
            parts[partIndex++] = `            <news:keywords>${escapeValueForXml(value.keywords)}</news:keywords>`;
          }
          if (value.stock_tickers) {
            parts[partIndex++] = `            <news:stock_tickers>${escapeValueForXml(value.stock_tickers)}</news:stock_tickers>`;
          }
          parts[partIndex++] = "        </news:news>";
        }
        break;
    }
  }
  parts[partIndex++] = "    </url>";
  return parts.slice(0, partIndex).join("\n");
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  const estimatedSize = urls.length + 5;
  const xmlParts = Array.from({ length: estimatedSize });
  let partIndex = 0;
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo && errorInfo.messages.length > 0) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  if (xslHref) {
    xmlParts[partIndex++] = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>`;
  } else {
    xmlParts[partIndex++] = '<?xml version="1.0" encoding="UTF-8"?>';
  }
  xmlParts[partIndex++] = URLSET_OPENING_TAG;
  for (const url of urls) {
    xmlParts[partIndex++] = buildUrlXml(url);
  }
  xmlParts[partIndex++] = "</urlset>";
  if (credits) {
    xmlParts[partIndex++] = `<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  const xmlContent = xmlParts.slice(0, partIndex);
  if (minify) {
    return xmlContent.join("").replace(/(?<!<[^>]*)\s(?![^<]*>)/g, "");
  }
  return xmlContent.join("\n");
}

function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  });
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = autoI18n.defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = autoI18n.locales.find((l) => l.code === localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path.search}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = withoutPrefixPaths[e._pathWithoutPrefix].map((u) => {
          const entries = [];
          if (u._locale.code === autoI18n.defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || autoI18n.defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (autoI18n.strategy === "no_prefix") ;
        if (autoI18n.differentDomains) {
          e.alternatives = [
            {
              // apply default locale domain
              ...autoI18n.locales.find((l) => [l.code, l.language].includes(autoI18n.defaultLocale)),
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          for (const l of autoI18n.locales) {
            let loc = e._pathWithoutPrefix;
            if (autoI18n.pages) {
              const pageKey = e._pathWithoutPrefix.replace(/^\//, "").replace(/\/index$/, "") || "index";
              const pageMappings = autoI18n.pages[pageKey];
              if (pageMappings && pageMappings[l.code] !== void 0) {
                const customPath = pageMappings[l.code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string")
                  loc = customPath.startsWith("/") ? customPath : `/${customPath}`;
              } else if (!autoI18n.differentDomains && !(["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy) && l.code === autoI18n.defaultLocale)) {
                loc = joinURL(`/${l.code}`, e._pathWithoutPrefix);
              }
            } else {
              if (!autoI18n.differentDomains && !(["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy) && l.code === autoI18n.defaultLocale))
                loc = joinURL(`/${l.code}`, e._pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...e,
              _index: void 0,
              _key: `${_sitemap || ""}${loc || "/"}${e._path.search}`,
              _locale: l,
              loc,
              alternatives: [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales].map((locale) => {
                const code = locale.code === "x-default" ? autoI18n.defaultLocale : locale.code;
                const isDefault = locale.code === "x-default" || locale.code === autoI18n.defaultLocale;
                let href = e._pathWithoutPrefix;
                if (autoI18n.pages) {
                  const pageKey = e._pathWithoutPrefix.replace(/^\//, "").replace(/\/index$/, "") || "index";
                  const pageMappings = autoI18n.pages[pageKey];
                  if (pageMappings && pageMappings[code] !== void 0) {
                    const customPath = pageMappings[code];
                    if (customPath === false)
                      return false;
                    if (typeof customPath === "string")
                      href = customPath.startsWith("/") ? customPath : `/${customPath}`;
                  } else if (autoI18n.strategy === "prefix") {
                    href = joinURL("/", code, e._pathWithoutPrefix);
                  } else if (["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy)) {
                    if (!isDefault) {
                      href = joinURL("/", code, e._pathWithoutPrefix);
                    }
                  }
                } else {
                  if (autoI18n.strategy === "prefix") {
                    href = joinURL("/", code, e._pathWithoutPrefix);
                  } else if (["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy)) {
                    if (!isDefault) {
                      href = joinURL("/", code, e._pathWithoutPrefix);
                    }
                  }
                }
                if (!filterPath(href))
                  return false;
                return {
                  hreflang: locale._hreflang,
                  href
                };
              }).filter(Boolean)
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path.search}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoI18n,
    isI18nMapped,
    isMultiSitemap,
    // sorting
    sortEntries,
    // chunking
    defaultSitemapsChunkSize
  } = runtimeConfig;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, defaultSitemapsChunkSize);
  function maybeSort(urls2) {
    return sortEntries ? sortInPlace(urls2) : urls2;
  }
  function maybeSlice(urls2) {
    return sliceUrlsForChunk(urls2, sitemap.sitemapName, sitemaps, defaultSitemapsChunkSize);
  }
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => [e.language, e.code].includes(sitemap.sitemapName))?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  let sourcesInput = effectiveSitemap.includeAppSources ? await globalSitemapSources() : [];
  sourcesInput.push(...await childSitemapSources(effectiveSitemap));
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: baseSitemapName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: sitemap.sitemapName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
  const filteredUrls = enhancedUrls.filter((e) => {
    if (isMultiSitemap && e._sitemap && sitemap.sitemapName)
      return e._sitemap === sitemap.sitemapName;
    return true;
  });
  const sortedUrls = maybeSort(filteredUrls);
  const urls = maybeSlice(sortedUrls);
  return { urls, failedSources };
}

function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = useSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || true,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    if (!getPathRobotConfig(event, { path, skipSiteIndexable: true }).indexable)
      continue;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, definition.defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, definition.defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError$1({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
const buildSitemapXmlCached = defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: 60 * 10,
    // Default 10 minutes
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  const xml = shouldCache ? await buildSitemapXmlCached(event, definition, resolvers, runtimeConfig) : await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

const _g4bmKA = defineEventHandler(async (e) => {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps) {
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 301);
  }
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
});

const _2YbsCC = eventHandler(async (event) => {
  const options = useRuntimeConfig(event).llms;
  const llms = JSON.parse(JSON.stringify(options));
  await useNitroApp().hooks.callHook("llms:generate", event, llms);
  await llmsHooks.callHook("generate", event, llms);
  const document = [
    `# ${llms.title || "Documentation"}`
  ];
  if (llms.description) {
    document.push(`> ${llms.description}`);
  }
  for (const section of llms.sections) {
    document.push(`## ${section.title}`);
    if (section.description) {
      document.push(section.description);
    }
    document.push(
      section.links?.map((link) => {
        return link.description ? `- [${link.title}](${link.href}): ${link.description}` : `- [${link.title}](${link.href})`;
      }).join("\n") || ""
    );
  }
  if (options.notes && options.notes.length) {
    document.push(
      "## Notes",
      (options.notes || []).map((note) => `- ${note}`).join("\n")
    );
  }
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return document.join("\n\n");
});

const _XdUEqE = eventHandler(async (event) => {
  const options = useRuntimeConfig(event).llms;
  const contents = [];
  const llms = JSON.parse(JSON.stringify(options));
  await useNitroApp().hooks.callHook("llms:generate:full", event, llms, contents);
  await llmsHooks.callHook("generate:full", event, llms, contents);
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return contents.join("\n\n");
});

const collections = {
  'lucide': () => import('../_/icons.mjs').then(m => m.default),
  'mdi': () => import('../_/icons2.mjs').then(m => m.default),
  'simple-icons': () => import('../_/icons3.mjs').then(m => m.default),
  'tabler': () => import('../_/icons4.mjs').then(m => m.default),
  'vscode-icons': () => import('../_/icons5.mjs').then(m => m.default),
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _IhV27e = defineCachedEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url)
    return createError$1({ status: 400, message: "Invalid icon request" });
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName ? await collections[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = url.searchParams.get("icons")?.split(",");
  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons
      );
      consola.debug(`[Icon] serving ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
      return data;
    }
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL("./" + basename(url.pathname) + url.search, apiEndPoint);
    consola.debug(`[Icon] fetching ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(getQuery(event).icons || "");
    return `${collection}_${icons.split(",")[0]}_${icons.length}_${hash$1(icons)}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

function injectHead() {
  if (hasInjectionContext()) {
    const instance = inject(headSymbol);
    if (!instance) {
      throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");
    }
    return instance;
  }
  throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");
}
function useHead(input, options = {}) {
  const head = options.head || injectHead();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const deactivated = ref(false);
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  }
  return entry;
}
function useSeoMeta(input = {}, options = {}) {
  const head = options.head || injectHead();
  head.use(FlatMetaPlugin);
  const { title, titleTemplate, ...meta } = input;
  return useHead({
    title,
    titleTemplate,
    _flatMeta: meta
  }, options);
}

function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

const createHeadCore = createUnhead;

function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

const appHead = {"link":[],"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"},{"property":"og:type","content":"website"}],"style":[],"script":[],"noscript":[],"htmlAttrs":{}};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt","class":"isolate"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appSpaLoaderTag = "div";

const appSpaLoaderAttrs = {"id":"__nuxt-loader"};

const appId = "nuxt-app";

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('../build/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('../build/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await import('../virtual/_virtual_spa-template.mjs').then((r) => r.template).catch(() => "").then((r) => {
    {
      const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
      const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
      const appTemplate = APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG;
      const loaderTemplate = r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "";
      return appTemplate + loaderTemplate;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => import('../build/styles.mjs').then((r) => r.default || r));
const getEntryIds = () => getClientManifest().then((r) => Object.values(r).filter(
  (r2) => (
    // @ts-expect-error internal key set by CSS inlining configuration
    r2._globalCSS
  )
).map((r2) => r2.src));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (error) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", error);
    throw error;
  });
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _bSX5Zc = eventHandler(async (event) => {
  const collection = getRouterParam(event, "collection");
  setHeader(event, "Content-Type", "text/plain");
  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || "";
  if (data) {
    const lineStart = `export const ${collection} = "`;
    const content = String(data).split("\n").find((line) => line.startsWith(lineStart));
    if (content) {
      return content.substring(lineStart.length, content.length - 1);
    }
  }
  return await import('../build/database.compressed.mjs').then((m) => m[collection]);
});

async function decompressSQLDump(base64Str, compressionType = "gzip") {
  const binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  const response = new Response(new Blob([binaryData]));
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text);
}

function refineContentFields(sql, doc) {
  const fields = findCollectionFields(sql);
  const item = { ...doc };
  for (const key in item) {
    if (fields[key] === "json" && item[key] && item[key] !== "undefined") {
      item[key] = JSON.parse(item[key]);
    }
    if (fields[key] === "boolean" && item[key] !== "undefined") {
      item[key] = Boolean(item[key]);
    }
  }
  for (const key in item) {
    if (item[key] === "NULL") {
      item[key] = void 0;
    }
  }
  return item;
}
function findCollectionFields(sql) {
  const table = sql.match(/FROM\s+(\w+)/);
  if (!table) {
    return {};
  }
  const info = contentManifest[getCollectionName(table[1])];
  return info?.fields || {};
}
function getCollectionName(table) {
  return table.replace(/^_content_/, "");
}

class BoundableStatement {
  _statement;
  constructor(rawStmt) {
    this._statement = rawStmt;
  }
  bind(...params) {
    return new BoundStatement(this, params);
  }
}
class BoundStatement {
  #statement;
  #params;
  constructor(statement, params) {
    this.#statement = statement;
    this.#params = params;
  }
  bind(...params) {
    return new BoundStatement(this.#statement, params);
  }
  all() {
    return this.#statement.all(...this.#params);
  }
  run() {
    return this.#statement.run(...this.#params);
  }
  get() {
    return this.#statement.get(...this.#params);
  }
}

function sqliteConnector(opts) {
  let _db;
  const getDB = () => {
    if (_db) {
      return _db;
    }
    if (opts.name === ":memory:") {
      _db = new Database(":memory:");
      return _db;
    }
    const filePath = resolve$2(
      opts.cwd || ".",
      opts.path || `.data/${opts.name || "db"}.sqlite3`
    );
    mkdirSync(dirname$1(filePath), { recursive: true });
    _db = new Database(filePath);
    return _db;
  };
  return {
    name: "sqlite",
    dialect: "sqlite",
    getInstance: () => getDB(),
    exec: (sql) => getDB().exec(sql),
    prepare: (sql) => new StatementWrapper(() => getDB().prepare(sql))
  };
}
class StatementWrapper extends BoundableStatement {
  async all(...params) {
    return this._statement().all(...params);
  }
  async run(...params) {
    const res = this._statement().run(...params);
    return { success: res.changes > 0, ...res };
  }
  async get(...params) {
    return this._statement().get(...params);
  }
}

let db;
function loadDatabaseAdapter(config) {
  const { database, localDatabase } = config;
  if (!db) {
    if (["nitro-prerender", "nitro-dev"].includes("node-server")) {
      db = sqliteConnector(refineDatabaseConfig(localDatabase));
    } else {
      db = sqliteConnector(refineDatabaseConfig(database));
    }
  }
  return {
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params).then((result) => (result || []).map((item) => refineContentFields(sql, item)));
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params).then((item) => item ? refineContentFields(sql, item) : item);
    },
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params);
    }
  };
}
const checkDatabaseIntegrity = {};
const integrityCheckPromise = {};
async function checkAndImportDatabaseIntegrity(event, collection, config) {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false;
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], checksumsStructure[String(collection)], config).then((isValid) => {
      checkDatabaseIntegrity[String(collection)] = !isValid;
    }).catch((error) => {
      console.error("Database integrity check failed", error);
      checkDatabaseIntegrity[String(collection)] = true;
      integrityCheckPromise[String(collection)] = null;
    });
  }
  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)];
  }
}
async function _checkAndImportDatabaseIntegrity(event, collection, integrityVersion, structureIntegrityVersion, config) {
  const db2 = loadDatabaseAdapter(config);
  const before = await db2.first(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => null);
  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    await db2.exec(`DROP TABLE IF EXISTS ${tables.info}`);
    before.version = "";
  }
  const unchangedStructure = before?.structureVersion === structureIntegrityVersion;
  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        return true;
      }
      await waitUntilDatabaseIsReady(db2, collection);
      return true;
    }
    await db2.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]);
    if (!unchangedStructure) {
      await db2.exec(`DROP TABLE IF EXISTS ${tables[collection]}`);
    }
  }
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump);
  const dumpLinesHash = dump.map((row) => row.split(" -- ").pop());
  let hashesInDb = /* @__PURE__ */ new Set();
  if (unchangedStructure) {
    const hashListFromTheDump = new Set(dumpLinesHash);
    const hashesInDbRecords = await db2.all(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => []);
    hashesInDb = new Set(hashesInDbRecords.map((r) => r.__hash__));
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump);
    if (hashesToDelete.size) {
      await db2.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill("?").join(",")})`, Array.from(hashesToDelete));
    }
  }
  await dump.reduce(async (prev, sql, index) => {
    await prev;
    const hash = dumpLinesHash[index];
    const statement = sql.substring(0, sql.length - hash.length - 4);
    if (unchangedStructure) {
      if (hash === "structure") {
        return Promise.resolve();
      }
      if (hashesInDb.has(hash)) {
        return Promise.resolve();
      }
    }
    await db2.exec(statement).catch((err) => {
      const message = err.message || "Unknown error";
      console.error(`Failed to execute SQL ${sql}: ${message}`);
    });
  }, Promise.resolve());
  const after = await db2.first(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: "" }));
  return after?.version === integrityVersion;
}
const REQUEST_TIMEOUT = 90;
async function waitUntilDatabaseIsReady(db2, collection) {
  let iterationCount = 0;
  let interval;
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db2.first(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }));
      if (row?.ready) {
        clearInterval(interval);
        resolve(0);
      }
      if (iterationCount++ > REQUEST_TIMEOUT) {
        clearInterval(interval);
        reject(new Error("Waiting for another database initialization timed out"));
      }
    }, 1e3);
  }).catch((e) => {
    throw e;
  }).finally(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
async function loadDatabaseDump(event, collection) {
  return await fetchDatabase(event, String(collection)).catch((e) => {
    console.error("Failed to fetch compressed dump", e);
    return "";
  });
}
function refineDatabaseConfig(config) {
  if (config.type === "d1") {
    return { ...config, bindingName: config.bindingName || config.binding };
  }
  if (config.type === "sqlite") {
    const _config = { ...config };
    if (config.filename === ":memory:") {
      return { name: "memory" };
    }
    if ("filename" in config) {
      const filename = isAbsolute(config?.filename || "") || config?.filename === ":memory:" ? config?.filename : new URL(config.filename, globalThis._importMeta_.url).pathname;
      _config.path = process.platform === "win32" && filename.startsWith("/") ? filename.slice(1) : filename;
    }
    return _config;
  }
  return config;
}

const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i;
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?([a-z_]\w+|\*)\)/i;
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/;
function assertSafeQuery(sql, collection) {
  if (!sql) {
    throw new Error("Invalid query");
  }
  const cleanedupQuery = cleanupQuery(sql);
  if (cleanedupQuery !== sql) {
    throw new Error("Invalid query");
  }
  const match = sql.match(SQL_SELECT_REGEX);
  if (!match) {
    throw new Error("Invalid query");
  }
  const [_, select, from, where, orderBy, order, limit, offset] = match;
  const columns = select.trim().split(", ");
  if (columns.length === 1) {
    if (columns[0] !== "*" && !columns[0].match(SQL_COUNT_REGEX) && !columns[0].match(/^"[a-z_]\w+"$/i)) {
      throw new Error("Invalid query");
    }
  } else if (!columns.every((column) => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error("Invalid query");
  }
  if (from !== `_content_${collection}`) {
    throw new Error("Invalid query");
  }
  if (where) {
    if (!where.startsWith(" WHERE (") || !where.endsWith(")")) {
      throw new Error("Invalid query");
    }
    const noString = cleanupQuery(where, { removeString: true });
    if (noString.match(SQL_COMMANDS)) {
      throw new Error("Invalid query");
    }
  }
  const _order = (orderBy + " " + order).split(", ");
  if (!_order.every((column) => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error("Invalid query");
  }
  if (limit !== void 0 && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error("Invalid query");
  }
  if (offset !== void 0 && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error("Invalid query");
  }
  return true;
}
function cleanupQuery(query, options = { removeString: false }) {
  let inString = false;
  let stringFence = "";
  let result = "";
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = query[i - 1];
    const nextChar = query[i + 1];
    if (char === "'" || char === '"') {
      if (!options?.removeString) {
        result += char;
        continue;
      }
      if (inString) {
        if (char !== stringFence || nextChar === stringFence || prevChar === stringFence) {
          continue;
        }
        inString = false;
        stringFence = "";
        continue;
      } else {
        inString = true;
        stringFence = char;
        continue;
      }
    }
    if (!inString) {
      if (char === "-" && nextChar === "-") {
        return result;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < query.length && !(query[i] === "*" && query[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }
      result += char;
    }
  }
  return result;
}

const _YCSK8B = eventHandler(async (event) => {
  const { sql } = await readBody(event);
  const collection = getRouterParam(event, "collection");
  assertSafeQuery(sql, collection);
  const conf = useRuntimeConfig().content;
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf);
  }
  return loadDatabaseAdapter(conf).all(sql);
});

const _D5Wa1q = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_2aJJao = () => import('../routes/raw/_...slug_.md.get.mjs');
const _lazy_sgAsEz = () => import('../routes/renderer.mjs');
const _lazy_7gj_xQ = () => import('../routes/__og-image__/font/font.mjs');
const _lazy_l2x2Z9 = () => import('../routes/__og-image__/image/image.mjs');

const handlers = [
  { route: '', handler: _innDqy, lazy: false, middleware: true, method: undefined },
  { route: '/raw/**:slug.md', handler: _lazy_2aJJao, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_sgAsEz, lazy: true, middleware: false, method: undefined },
  { route: '', handler: _j88xv_, lazy: false, middleware: true, method: undefined },
  { route: '/robots.txt', handler: _VNFb0_, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _wSc17j, lazy: false, middleware: true, method: undefined },
  { route: '/__sitemap__/nuxt-content-urls.json', handler: _JzGfm0, lazy: false, middleware: false, method: undefined },
  { route: '/__sitemap__/style.xsl', handler: _Zo8bT5, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _g4bmKA, lazy: false, middleware: false, method: undefined },
  { route: '/__og-image__/font/**', handler: _lazy_7gj_xQ, lazy: true, middleware: false, method: undefined },
  { route: '/__og-image__/image/**', handler: _lazy_l2x2Z9, lazy: true, middleware: false, method: undefined },
  { route: '/__og-image__/static/**', handler: _lazy_l2x2Z9, lazy: true, middleware: false, method: undefined },
  { route: '/llms.txt', handler: _2YbsCC, lazy: false, middleware: false, method: "get" },
  { route: '/llms-full.txt', handler: _XdUEqE, lazy: false, middleware: false, method: "get" },
  { route: '/api/_nuxt_icon/:collection', handler: _IhV27e, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/sql_dump.txt', handler: _bSX5Zc, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/query', handler: _YCSK8B, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _D5Wa1q, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_sgAsEz, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { parseQuery as $, prefixStorage as A, useStorage as B, useNitroOrigin as C, emojiCache as D, useOgImageRuntimeConfig as E, fetchIsland as F, createHeadCore as G, normaliseFontInput as H, theme as I, withTrailingSlash as J, handleCacheHeaders as K, setHeaders as L, hash$1 as M, parseURL as N, setResponseHeader as O, proxyRequest as P, sendRedirect as Q, resolveContext as R, H3Error as S, serialize$1 as T, useHead as U, defu as V, klona as W, defuFn as X, joinURL as Y, withQuery as Z, headSymbol as _, getResponseStatusText as a, isEqual as a0, getContext as a1, withoutTrailingSlash as a2, hasProtocol as a3, isScriptProtocol as a4, sanitizeStatusCode as a5, $fetch$1 as a6, baseURL as a7, resolveUnrefHeadInput as a8, createHooks as a9, executeAsync as aa, titleCase as ab, encodeParam as ac, encodePath as ad, toRouteMatcher as ae, createRouter$1 as af, camelCase as ag, withoutBase as ah, useSeoMeta as ai, stringifyQuery as aj, pascalCase as ak, withBase as al, decodeHtml as am, logger$1 as an, toBase64Image as ao, htmlDecodeQuotes as ap, sendError as aq, fontCache as ar, kebabCase as as, nodeServer as at, getResponseStatus as b, createError$1 as c, appId as d, eventHandler as e, defineRenderHandler as f, getRouterParams as g, buildAssetsURL as h, appTeleportTag as i, appTeleportAttrs as j, getQuery as k, createSSRContext as l, appHead as m, destr as n, setSSRError as o, publicAssetsURL as p, queryCollection as q, getRouteRules as r, setHeader as s, getRenderer as t, getEntryIds as u, renderInlineStyles as v, withLeadingSlash as w, replaceIslandTeleports as x, useNitroApp as y, defineEventHandler as z };
//# sourceMappingURL=nitro.mjs.map
