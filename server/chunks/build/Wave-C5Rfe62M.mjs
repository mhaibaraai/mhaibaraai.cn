import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  __name: "Wave",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: false, default: "title" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full w-full flex items-start justify-start bg-yellow-50 relative" }, _attrs))}><h1 class="text-7xl p-20 font-bold text-left text-gray-900" style="${ssrRenderStyle({ "display": "block", "line-clamp": "2", "text-overflow": "ellipsis" })}">${ssrInterpolate(__props.title)}</h1><svg class="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 627" width="1200" height="627" xmlns="http://www.w3.org/2000/svg"><path d="M0 513L28.5 509.8C57 506.7 114 500.3 171.2 484.5C228.3 468.7 285.7 443.3 342.8 435C400 426.7 457 435.3 514.2 447.3C571.3 459.3 628.7 474.7 685.8 490.7C743 506.7 800 523.3 857.2 522.5C914.3 521.7 971.7 503.3 1028.8 491.8C1086 480.3 1143 475.7 1171.5 473.3L1200 471L1200 628L1171.5 628C1143 628 1086 628 1028.8 628C971.7 628 914.3 628 857.2 628C800 628 743 628 685.8 628C628.7 628 571.3 628 514.2 628C457 628 400 628 342.8 628C285.7 628 228.3 628 171.2 628C114 628 57 628 28.5 628L0 628Z" fill="#fbbf24" strokeLinecap="round" strokeLinejoin="miter"></path></svg></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/nuxt-og-image@5.1.9_@unhead+vue@2.0.14_vue@3.5.20_typescript@5.9.2___magicast@0.3.5_uns_72e45795b7fc49ba4cf48742553d9d47/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Wave.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Wave-C5Rfe62M.mjs.map
