import { ref, computed, useId, unref, withCtx, createVNode, resolveDynamicComponent, mergeProps, createBlock, openBlock, defineComponent, createCommentVNode, Transition, TransitionGroup, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderVNode, ssrRenderClass } from 'vue/server-renderer';
import { w as withLeadingSlash, J as withTrailingSlash, Y as joinURL } from '../nitro/nitro.mjs';
import { DialogRoot, DialogTrigger, DialogPortal } from 'reka-ui';
import { M as Motion, u as useAnimatePresence, a as useMotionConfig, m as mountedStates, r as removeDoneCallback, f as frame, d as doneCallbacks } from './index-D2ADDnM6.mjs';
import { a as useAppConfig, M as createReusableTemplate, t as tv, S as useRuntimeConfig, x as useEventListener, I as ImageComponent } from './server.mjs';
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
import 'hey-listen';
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

function usePopLayout(props) {
  const styles = /* @__PURE__ */ new WeakMap();
  const config = useMotionConfig();
  function addPopStyle(state) {
    if (props.mode !== "popLayout")
      return;
    const element = state.element;
    const parent = element.offsetParent;
    const parentWidth = parent instanceof HTMLElement ? parent.offsetWidth || 0 : 0;
    const size = {
      height: element.offsetHeight || 0,
      width: element.offsetWidth || 0,
      top: element.offsetTop,
      left: element.offsetLeft,
      right: 0
    };
    size.right = parentWidth - size.width - size.left;
    const x = props.anchorX === "left" ? `left: ${size.left}` : `right: ${size.right}`;
    state.element.dataset.motionPopId = state.id;
    const style = (void 0).createElement("style");
    if (config.value.nonce) {
      style.nonce = config.value.nonce;
    }
    styles.set(state, style);
    (void 0).head.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
    [data-motion-pop-id="${state.id}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
      ${x}px !important;
      }
      `);
    }
  }
  function removePopStyle(state) {
    const style = styles.get(state);
    if (!style)
      return;
    styles.delete(state);
    frame.render(() => {
      (void 0).head.removeChild(style);
    });
  }
  return {
    addPopStyle,
    removePopStyle,
    styles
  };
}
function delay(fn) {
  return Promise.resolve().then(() => {
    fn();
  });
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "AnimatePresence",
    inheritAttrs: true
  },
  __name: "AnimatePresence",
  props: {
    mode: { default: "sync" },
    initial: { type: Boolean, default: true },
    as: {},
    custom: {},
    onExitComplete: {},
    anchorX: { default: "left" }
  },
  setup(__props) {
    const props = __props;
    useAnimatePresence(props);
    const { addPopStyle, removePopStyle, styles } = usePopLayout(props);
    function findMotionElement(el) {
      let current = el;
      while (current) {
        if (mountedStates.get(current)) {
          return current;
        }
        current = current.firstElementChild;
      }
      return null;
    }
    function enter(el) {
      const state = mountedStates.get(el);
      if (!state) {
        return;
      }
      removePopStyle(state);
      state.isVShow = true;
      removeDoneCallback(el);
      delay(() => {
        state.setActive("exit", false);
      });
    }
    const exitDom = /* @__PURE__ */ new Map();
    function exit(el, done) {
      var _a;
      const motionEl = findMotionElement(el);
      const state = mountedStates.get(motionEl);
      if (!motionEl || !state) {
        done();
        if (exitDom.size === 0) {
          (_a = props.onExitComplete) == null ? void 0 : _a.call(props);
        }
        return;
      }
      exitDom.set(motionEl, true);
      removeDoneCallback(motionEl);
      addPopStyle(state);
      function doneCallback(e) {
        var _a2, _b;
        if ((_a2 = e == null ? void 0 : e.detail) == null ? void 0 : _a2.isExit) {
          const projection = state.visualElement.projection;
          if ((projection == null ? void 0 : projection.animationProgress) > 0 && !state.isSafeToRemove && !state.isVShow) {
            return;
          }
          removeDoneCallback(motionEl);
          exitDom.delete(motionEl);
          if (exitDom.size === 0) {
            (_b = props.onExitComplete) == null ? void 0 : _b.call(props);
          }
          if (!styles.has(state)) {
            state.willUpdate("done");
          } else {
            removePopStyle(state);
          }
          done();
          if (!motionEl.isConnected) {
            state.unmount(true);
          }
        }
      }
      delay(() => {
        state.setActive("exit", true);
        doneCallbacks.set(motionEl, doneCallback);
        motionEl.addEventListener("motioncomplete", doneCallback);
      });
    }
    const transitionProps = computed(() => {
      if (props.mode !== "wait") {
        return {
          tag: props.as
        };
      }
      return {
        mode: props.mode === "wait" ? "out-in" : void 0
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(_ctx.mode === "wait" ? Transition : TransitionGroup), mergeProps({ css: false }, transitionProps.value, {
        appear: "",
        onEnter: enter,
        onLeave: exit
      }), {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
      }, 16);
    };
  }
});
const theme = {
  "slots": {
    "base": "rounded-md",
    "overlay": "fixed inset-0 bg-default/75 backdrop-blur-sm will-change-opacity",
    "content": "fixed inset-0 flex items-center justify-center cursor-zoom-out focus:outline-none p-4 sm:p-8"
  },
  "variants": {
    "zoom": {
      "true": "will-change-transform"
    },
    "open": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "zoom": true,
      "open": false,
      "class": "cursor-zoom-in"
    }
  ]
};
const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "ProseImg",
  __ssrInlineRender: true,
  props: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: [String, Number], required: false },
    height: { type: [String, Number], required: false },
    class: { type: null, required: false },
    zoom: { type: Boolean, required: false, default: true },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const [DefineImageTemplate, ReuseImageTemplate] = createReusableTemplate();
    const open = ref(false);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.img || {} })({
      zoom: props.zoom,
      open: open.value
    }));
    const refinedSrc = computed(() => {
      if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
        const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));
        if (_base !== "/" && !props.src.startsWith(_base)) {
          return joinURL(_base, props.src);
        }
      }
      return props.src;
    });
    const layoutId = computed(() => `${refinedSrc.value}::${useId()}`);
    if (props.zoom) {
      useEventListener(void 0, "scroll", () => {
        open.value = false;
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineImageTemplate), null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
              src: refinedSrc.value,
              alt: __props.alt,
              width: __props.width,
              height: __props.height
            }, _ctx.$attrs, {
              class: ui.value.base({ class: [props.ui?.base, props.class] })
            }), null), _parent2, _scopeId);
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
                src: refinedSrc.value,
                alt: __props.alt,
                width: __props.width,
                height: __props.height
              }, _ctx.$attrs, {
                class: ui.value.base({ class: [props.ui?.base, props.class] })
              }), null, 16, ["src", "alt", "width", "height", "class"]))
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.zoom) {
        _push(ssrRenderComponent(unref(DialogRoot), {
          open: open.value,
          "onUpdate:open": ($event) => open.value = $event,
          modal: false
        }, {
          default: withCtx(({ close }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(DialogTrigger), { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(Motion), {
                      "layout-id": layoutId.value,
                      "as-child": "",
                      transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                    }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(unref(ReuseImageTemplate))
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(Motion), {
                        "layout-id": layoutId.value,
                        "as-child": "",
                        transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(ReuseImageTemplate))
                        ]),
                        _: 1
                      }, 8, ["layout-id"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(DialogPortal), null, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(_sfc_main$1), null, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          if (open.value) {
                            _push4(ssrRenderComponent(unref(Motion), {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                              class: ui.value.overlay({ class: [props.ui?.overlay] })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (open.value) {
                            _push4(`<div class="${ssrRenderClass(ui.value.content({ class: [props.ui?.content] }))}"${_scopeId3}>`);
                            _push4(ssrRenderComponent(unref(Motion), {
                              "as-child": "",
                              "layout-id": layoutId.value,
                              transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                            }, {
                              default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(unref(ReuseImageTemplate))
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`</div>`);
                          } else {
                            _push4(`<!---->`);
                          }
                        } else {
                          return [
                            open.value ? (openBlock(), createBlock(unref(Motion), {
                              key: 0,
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                              class: ui.value.overlay({ class: [props.ui?.overlay] })
                            }, null, 8, ["class"])) : createCommentVNode("", true),
                            open.value ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: ui.value.content({ class: [props.ui?.content] }),
                              onClick: close
                            }, [
                              createVNode(unref(Motion), {
                                "as-child": "",
                                "layout-id": layoutId.value,
                                transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                              }, {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseImageTemplate))
                                ]),
                                _: 1
                              }, 8, ["layout-id"])
                            ], 10, ["onClick"])) : createCommentVNode("", true)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(_sfc_main$1), null, {
                        default: withCtx(() => [
                          open.value ? (openBlock(), createBlock(unref(Motion), {
                            key: 0,
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            class: ui.value.overlay({ class: [props.ui?.overlay] })
                          }, null, 8, ["class"])) : createCommentVNode("", true),
                          open.value ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: ui.value.content({ class: [props.ui?.content] }),
                            onClick: close
                          }, [
                            createVNode(unref(Motion), {
                              "as-child": "",
                              "layout-id": layoutId.value,
                              transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                            }, {
                              default: withCtx(() => [
                                createVNode(unref(ReuseImageTemplate))
                              ]),
                              _: 1
                            }, 8, ["layout-id"])
                          ], 10, ["onClick"])) : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1024)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(DialogTrigger), { "as-child": "" }, {
                  default: withCtx(() => [
                    createVNode(unref(Motion), {
                      "layout-id": layoutId.value,
                      "as-child": "",
                      transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(ReuseImageTemplate))
                      ]),
                      _: 1
                    }, 8, ["layout-id"])
                  ]),
                  _: 1
                }),
                createVNode(unref(DialogPortal), null, {
                  default: withCtx(() => [
                    createVNode(unref(_sfc_main$1), null, {
                      default: withCtx(() => [
                        open.value ? (openBlock(), createBlock(unref(Motion), {
                          key: 0,
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          exit: { opacity: 0 },
                          class: ui.value.overlay({ class: [props.ui?.overlay] })
                        }, null, 8, ["class"])) : createCommentVNode("", true),
                        open.value ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: ui.value.content({ class: [props.ui?.content] }),
                          onClick: close
                        }, [
                          createVNode(unref(Motion), {
                            "as-child": "",
                            "layout-id": layoutId.value,
                            transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(ReuseImageTemplate))
                            ]),
                            _: 1
                          }, 8, ["layout-id"])
                        ], 10, ["onClick"])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1024)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent));
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.0_@babel+parser@7.28.3_@netlify+blobs@9.1.2_change-case@5.4.4_db0@_9d4b2e9f87a677038577d18a975a498e/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Img-DodoyTWy.mjs.map
