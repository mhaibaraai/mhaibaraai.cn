import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { R as useSiteConfig } from './server.mjs';
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
import 'minimark/hast';
import 'node:url';
import '@iconify/utils';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'better-sqlite3';
import 'ipx';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'reka-ui';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '@movk/core';

const _imports_0 = publicAssetsURL("/i-llustration.png");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Docs",
  __ssrInlineRender: true,
  props: {
    colorMode: { default: "light" },
    title: { default: "title" },
    description: { default: "description" },
    theme: { default: "#6366f1" },
    siteLogo: {},
    siteName: {}
  },
  setup(__props) {
    const props = __props;
    const siteConfig = useSiteConfig();
    const siteName = computed(() => {
      return props.siteName || siteConfig.name;
    });
    const siteLogo = computed(() => {
      return props.siteLogo || siteConfig.logo;
    });
    const title = computed(() => (props.title || "").slice(0, 60));
    const description = computed(() => (props.description || "").slice(0, 200));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-full flex flex-row justify-center items-center p-16 bg-[#9ca3af0d]" }, _attrs))}><svg class="absolute top-0 left-0 h-[380px] pointer-events-none" viewBox="0 0 1200 380" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradientBackground" x1="0" y1="0" x2="0" y2="380" gradientUnits="userSpaceOnUse"><stop offset="0%"${ssrRenderAttr("stop-color", _ctx.theme)} stop-opacity="0.1"></stop><stop offset="100%"${ssrRenderAttr("stop-color", _ctx.theme)} stop-opacity="0"></stop></linearGradient></defs><rect width="100%" height="100%" fill="url(#gradientBackground)"></rect></svg><div class="w-[600]"><div class="flex flex-col w-full max-w-[90%]"><h1 class="m-0 font-bold mb-[30px] text-[75px] leading-none" style="${ssrRenderStyle([{ "display": "block", "text-overflow": "ellipsis" }, { lineClamp: description.value ? 2 : 3 }])}">${ssrInterpolate(title.value)}</h1>`);
      if (description.value) {
        _push(`<p class="${ssrRenderClass([[
          _ctx.colorMode === "light" ? ["text-gray-700"] : ["text-gray-300"]
        ], "text-[28px] leading-12"])}" style="${ssrRenderStyle({ "display": "block", "line-clamp": "3", "text-overflow": "ellipsis" })}">${ssrInterpolate(description.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-row gap-4 items-center mt-10">`);
      if (siteLogo.value) {
        _push(`<img${ssrRenderAttr("src", siteLogo.value)} height="48" class="rounded-full object-cover shrink-0">`);
      } else {
        _push(`<!---->`);
      }
      if (siteName.value) {
        _push(`<p style="${ssrRenderStyle({ "font-size": "25px" })}" class="font-bold">${ssrInterpolate(siteName.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><img width="400" alt="Illustration" class="rounded-lg shadow-2xl ring mx-auto" style="${ssrRenderStyle({
        "--tw-ring-color": "#e7e3e4"
      })}"${ssrRenderAttr("src", _imports_0)}></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/og-image/Docs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Docs = Object.assign(_sfc_main, { __name: "OgImageDocs" });

export { Docs as default };
//# sourceMappingURL=Docs-ROSTLQID.mjs.map
