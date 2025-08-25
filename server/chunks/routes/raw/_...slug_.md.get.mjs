import { e as eventHandler, g as getRouterParams, c as createError, w as withLeadingSlash, q as queryCollection, s as setHeader } from '../../nitro/nitro.mjs';
import { stringify } from 'minimark/stringify';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'minimark/hast';
import 'node:url';
import '@iconify/utils';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'better-sqlite3';
import 'ipx';

const ____slug__md_get = eventHandler(async (event) => {
  var _a;
  const slug = getRouterParams(event)["slug.md"];
  if (!(slug == null ? void 0 : slug.endsWith(".md"))) {
    throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
  }
  const path = withLeadingSlash(slug.replace(".md", ""));
  const page = await queryCollection(event, "docs").path(path).first();
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
  }
  if (((_a = page.body.value[0]) == null ? void 0 : _a[0]) !== "h1") {
    page.body.value.unshift(["blockquote", {}, page.description]);
    page.body.value.unshift(["h1", {}, page.title]);
  }
  setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  return stringify({ ...page.body, type: "minimark" }, { format: "markdown/html" });
});

export { ____slug__md_get as default };
//# sourceMappingURL=_...slug_.md.get.mjs.map
