const sources = [
    {
        "context": {
            "name": "sitemap:urls",
            "description": "Set with the `sitemap.urls` config."
        },
        "urls": [],
        "sourceType": "user"
    },
    {
        "context": {
            "name": "@nuxt/content@v3:urls",
            "description": "Generated from your markdown files.",
            "tips": [
                "Parsing the following collections: "
            ]
        },
        "fetch": "/__sitemap__/nuxt-content-urls.json",
        "sourceType": "app"
    },
    {
        "context": {
            "name": "nuxt:pages",
            "description": "Generated from your static page files.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:pages'] }`."
            ]
        },
        "urls": [
            {
                "loc": "/"
            }
        ],
        "sourceType": "app"
    },
    {
        "context": {
            "name": "nuxt:prerender",
            "description": "Generated at build time when prerendering.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:prerender'] }`."
            ]
        },
        "urls": [
            "/",
            {
                "loc": "/",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/w_300/i-llustration.png"
                    }
                ]
            },
            {
                "loc": "/tools"
            },
            {
                "loc": "/guides"
            },
            {
                "loc": "/ecosystem"
            },
            {
                "loc": "/tools/package-managers/pnpm"
            },
            {
                "loc": "/tools/version-control/fnm"
            },
            {
                "loc": "/tools/package-managers/homebrew"
            },
            {
                "loc": "/tools/editors/vscode",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/git-prune.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/gitlens-commit-message.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/quick-operating.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/service-config.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/add-vscode-action.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/use-service.png"
                    }
                ]
            },
            {
                "loc": "/tools/version-control/git",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/vscode/git-vscode-gpg.png"
                    }
                ]
            },
            {
                "loc": "/tools/editors/idea",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/tools/editors/idea/copyright.png"
                    }
                ]
            },
            {
                "loc": "/guides/deployment/digitalocean",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/digitalocean/create-entry.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/digitalocean/create-droplets-config.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/digitalocean/droplets-dashboard.png"
                    }
                ]
            },
            {
                "loc": "/guides/os/linux"
            },
            {
                "loc": "/guides/os/macos",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2-default.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2-import.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2-theme.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2-status.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/os/macos/iterm2-status-active.png"
                    }
                ]
            },
            {
                "loc": "/guides/platforms/dingtalk"
            },
            {
                "loc": "/guides/runtime/node"
            },
            {
                "loc": "/guides/deployment/postgresql-guide"
            },
            {
                "loc": "/guides/platforms/gitlab-ci",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-start.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/merge-request-workflow.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/build-deploy-workflow.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/ci-start-notify.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/gitlab-ci/manual-run-pipeline.png"
                    }
                ]
            },
            {
                "loc": "/guides/deployment/docker",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/docker/docker-compose-result.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/docker/cloudflare-a-record.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/deployment/docker/cloudflare-create-certificate.png"
                    }
                ]
            },
            {
                "loc": "/ecosystem/javascript/async-await"
            },
            {
                "loc": "/guides/platforms/iserver",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/mapInterface.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/zxyTileImage.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/wms130.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/dataInterface.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/sldBody.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/sldBodyReply.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/geojson.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/releaseError.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/wfsError1.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/wfsError2.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/wfsError3.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/guides/platforms/iserver/wfsError4.png"
                    }
                ]
            },
            {
                "loc": "/ecosystem/styles/css"
            },
            {
                "loc": "/ecosystem/typescript/declare-global"
            },
            {
                "loc": "/ecosystem/java/global-cache"
            },
            {
                "loc": "/ecosystem/vue/issues"
            },
            {
                "loc": "/ecosystem/vite/auto-import"
            },
            {
                "loc": "/ecosystem/javascript/fetch"
            },
            {
                "loc": "/ecosystem/nuxt/copy-page"
            },
            {
                "loc": "/ecosystem/ui-libraries/element-plus"
            },
            {
                "loc": "/ecosystem/vite/resources-import"
            },
            {
                "loc": "/ecosystem/nuxt/issues"
            },
            {
                "loc": "/ecosystem/java/mac-install"
            },
            {
                "loc": "/ecosystem/styles/sass"
            },
            {
                "loc": "/ecosystem/nuxt/llms"
            },
            {
                "loc": "/ecosystem/nuxt/nuxt-seo",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/ecosystem/nuxt/og-image.png"
                    }
                ]
            },
            {
                "loc": "/tools/package-managers"
            },
            {
                "loc": "/ecosystem/nuxt/ssr-pm2-deploy",
                "images": [
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/ecosystem/nuxt/verify-pm2.png"
                    },
                    {
                        "loc": "https://mhaibaraai.cn/_ipx/_/images/ecosystem/nuxt/sitemap.png"
                    }
                ]
            },
            {
                "loc": "/tools/version-control"
            },
            {
                "loc": "/tools/editors"
            },
            {
                "loc": "/guides/deployment"
            },
            {
                "loc": "/guides/os"
            },
            {
                "loc": "/guides/platforms"
            },
            {
                "loc": "/guides/runtime"
            },
            {
                "loc": "/ecosystem/javascript"
            },
            {
                "loc": "/ecosystem/styles"
            },
            {
                "loc": "/ecosystem/typescript"
            },
            {
                "loc": "/ecosystem/java"
            },
            {
                "loc": "/ecosystem/vue"
            },
            {
                "loc": "/ecosystem/vite"
            },
            {
                "loc": "/ecosystem/nuxt"
            },
            {
                "loc": "/ecosystem/ui-libraries"
            }
        ],
        "sourceType": "app"
    }
];

export { sources };
//# sourceMappingURL=global-sources.mjs.map
