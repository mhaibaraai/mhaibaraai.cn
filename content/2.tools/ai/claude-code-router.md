---
title: Claude Code Router
description: 通过 Claude Code Router 使用其他提供商的任何模型进行 CC 操作
---

## Claude Code Router 安装

::note{to="https://github.com/musistudio/claude-code-router"}
`claude-code-router` 仓库地址
::

### `~/.claude-code-router/config.json` 配置示例

::code-collapse

```json [~/.claude-code-router/config.json]
{
  "LOG": false,
  "LOG_LEVEL": "debug",
  "CLAUDE_PATH": "",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "APIKEY": "",
  "API_TIMEOUT_MS": "600000",
  "PROXY_URL": "",
  "transformers": [],
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-xxx",
      "models": [
        "z-ai/glm-4.5-air:free",
        "anthropic/claude-sonnet-4.5",
        "openai/gpt-5-codex",
        "google/gemini-2.5-pro",
        "google/gemini-2.5-flash"
      ],
      "transformer": {
        "use": [
          "openrouter"
        ]
      }
    },
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/chat/completions",
      "api_key": "sk-xxx",
      "models": [
        "deepseek-chat",
        "deepseek-reasoner"
      ],
      "transformer": {
        "use": [
          "deepseek"
        ],
        "deepseek-chat": {
          "use": [
            "tooluse"
          ]
        }
      }
    }
  ],
  "StatusLine": {
    "enabled": true,
    "currentStyle": "default",
    "default": {
      "modules": [
        {
          "type": "model",
          "icon": "🤖",
          "text": "{{model}}",
          "color": "bright_yellow"
        },
        {
          "type": "usage",
          "icon": "📊",
          "text": "{{inputTokens}} → {{outputTokens}}",
          "color": "bright_magenta"
        }
      ]
    },
    "powerline": {
      "modules": []
    }
  },
  "Router": {
    "default": "openrouter,z-ai/glm-4.5-air:free",
    "background": "",
    "think": "",
    "longContext": "",
    "longContextThreshold": 60000,
    "webSearch": "",
    "image": ""
  },
  "CUSTOM_ROUTER_PATH": ""
}
```

::

::caution{to="https://github.com/musistudio/claude-code-router/issues/201"}

`provider_response_error` 报错 issues 参考：

```log
API Error: 404 {"error":{"message":"Error from provider(openrouter,deepseek/deepseek-chat-v3.1:free: 404): {\"error\":{\"message\":\"No endpoints found that support tool use. To learn more 
    about provider routing, visit: https://openrouter.ai/docs/provider-routing\",\"code\":404}}
```
这个错误通常是因为所选模型不支持工具使用。可以尝试更换其他模型，例如 `z-ai/glm-4.5-air:free`。
::

成功启动！

```bash [sh]
ccr code
```

![ccr-code.png](/images/tools/ai/ccr-code.png)

## VS Code 插件

::note{to="https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code" icon="i-material-icon-theme:claude"}
Claude Code for VS Code
::

### `~/.claude/settings.json` 配置示例

```json [~/.claude/settings.json]
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:3456",
    "ANTHROPIC_AUTH_TOKEN": "openrouter_key",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [],
    "deny": [],
    "defaultMode":"acceptEdits"
  },
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

### `~/.claude/config.json` 配置示例

```json [~/.claude/config.json]
{
  "primaryApiKey": "api"
}
```

::note{to="https://github.com/mhaibaraai/cursor-settings" icon="i-lucide-github"}
更多用法参见我的个人配置仓库
::

## 在终端中使用

```bash [sh]
claude
```

![claude-terminal.png](/images/tools/ai/claude-terminal.png)

## 在插件中使用

![claude-vscode.png](/images/tools/ai/claude-vscode.png)
