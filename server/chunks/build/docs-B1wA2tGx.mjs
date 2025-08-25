import { O as useRoute, D as _sfc_main$o, a5 as _sfc_main$b, a6 as _sfc_main$9, a as useAppConfig, t as tv } from './server.mjs';
import { _ as _sfc_main$2 } from './Page-qX_INIlN.mjs';
import { defineComponent, inject, computed, withCtx, renderSlot, unref, createVNode, createBlock, openBlock, useSlots, mergeProps, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { Primitive } from 'reka-ui';
import { a as findPageChildren } from './index-B3fo9P8d.mjs';
import '../nitro/nitro.mjs';
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
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '@movk/core';

const theme = {
  "slots": {
    "root": "hidden overflow-y-auto lg:block lg:max-h-[calc(100vh-var(--ui-header-height))] lg:sticky lg:top-(--ui-header-height) py-8 lg:ps-4 lg:-ms-4 lg:pe-6.5",
    "container": "relative",
    "top": "sticky -top-8 -mt-8 pointer-events-none z-[1]",
    "topHeader": "h-8 bg-default -mx-4 px-4",
    "topBody": "bg-default relative pointer-events-auto flex flex-col -mx-4 px-4",
    "topFooter": "h-8 bg-gradient-to-b from-default -mx-4 px-4"
  }
};
const _sfc_main$1 = {
  __name: "UPageAside",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "aside" },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.pageAside || {} })());
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}>`);
            if (!!slots.top) {
              _push2(`<div class="${ssrRenderClass(ui.value.top({ class: props.ui?.top }))}"${_scopeId}><div class="${ssrRenderClass(ui.value.topHeader({ class: props.ui?.topHeader }))}"${_scopeId}></div><div class="${ssrRenderClass(ui.value.topBody({ class: props.ui?.topBody }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "top", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div><div class="${ssrRenderClass(ui.value.topFooter({ class: props.ui?.topFooter }))}"${_scopeId}></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", {
                class: ui.value.container({ class: props.ui?.container })
              }, [
                !!slots.top ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: ui.value.top({ class: props.ui?.top })
                }, [
                  createVNode("div", {
                    class: ui.value.topHeader({ class: props.ui?.topHeader })
                  }, null, 2),
                  createVNode("div", {
                    class: ui.value.topBody({ class: props.ui?.topBody })
                  }, [
                    renderSlot(_ctx.$slots, "top")
                  ], 2),
                  createVNode("div", {
                    class: ui.value.topFooter({ class: props.ui?.topFooter })
                  }, null, 2)
                ], 2)) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "default"),
                renderSlot(_ctx.$slots, "bottom")
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.0_@babel+parser@7.28.3_@netlify+blobs@9.1.2_change-case@5.4.4_db0@_9d4b2e9f87a677038577d18a975a498e/node_modules/@nuxt/ui/dist/runtime/components/PageAside.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "docs",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const navigation = inject("navigation");
    const childrenNavigation = computed(() => {
      const slug = route.params.slug?.[0];
      const children = findPageChildren(navigation?.value, `/${slug}`, { indexAsChild: true });
      return children;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UContainer = _sfc_main$o;
      const _component_UPage = _sfc_main$2;
      const _component_UPageAside = _sfc_main$1;
      const _component_UContentSearchButton = _sfc_main$b;
      const _component_UContentNavigation = _sfc_main$9;
      _push(ssrRenderComponent(_component_UContainer, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UPage, null, {
              left: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UPageAside, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UContentSearchButton, {
                          collapsed: false,
                          class: "mb-8 w-full",
                          size: "sm"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UContentNavigation, {
                          key: unref(route).path,
                          highlight: "",
                          navigation: unref(childrenNavigation),
                          ui: {
                            linkTrailingBadge: "font-semibold uppercase",
                            linkLeadingIcon: "size-4 mr-1",
                            linkTrailing: "hidden"
                          }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UContentSearchButton, {
                            collapsed: false,
                            class: "mb-8 w-full",
                            size: "sm"
                          }),
                          (openBlock(), createBlock(_component_UContentNavigation, {
                            key: unref(route).path,
                            highlight: "",
                            navigation: unref(childrenNavigation),
                            ui: {
                              linkTrailingBadge: "font-semibold uppercase",
                              linkLeadingIcon: "size-4 mr-1",
                              linkTrailing: "hidden"
                            }
                          }, null, 8, ["navigation"]))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UPageAside, null, {
                      default: withCtx(() => [
                        createVNode(_component_UContentSearchButton, {
                          collapsed: false,
                          class: "mb-8 w-full",
                          size: "sm"
                        }),
                        (openBlock(), createBlock(_component_UContentNavigation, {
                          key: unref(route).path,
                          highlight: "",
                          navigation: unref(childrenNavigation),
                          ui: {
                            linkTrailingBadge: "font-semibold uppercase",
                            linkLeadingIcon: "size-4 mr-1",
                            linkTrailing: "hidden"
                          }
                        }, null, 8, ["navigation"]))
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "default")
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UPage, null, {
                left: withCtx(() => [
                  createVNode(_component_UPageAside, null, {
                    default: withCtx(() => [
                      createVNode(_component_UContentSearchButton, {
                        collapsed: false,
                        class: "mb-8 w-full",
                        size: "sm"
                      }),
                      (openBlock(), createBlock(_component_UContentNavigation, {
                        key: unref(route).path,
                        highlight: "",
                        navigation: unref(childrenNavigation),
                        ui: {
                          linkTrailingBadge: "font-semibold uppercase",
                          linkLeadingIcon: "size-4 mr-1",
                          linkTrailing: "hidden"
                        }
                      }, null, 8, ["navigation"]))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default")
                ]),
                _: 3
              })
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/docs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=docs-B1wA2tGx.mjs.map
