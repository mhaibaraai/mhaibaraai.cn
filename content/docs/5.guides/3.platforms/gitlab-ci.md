---
title: GitLab CI/CD 完全指南
description: 一份涵盖从入门、配置到问题排查的完整 CI/CD 实践文档，实现快速上手并高效利用自动化流水线。
---

## 参考文档

::note{icon="i-lucide-book" to="https://gitlab.cn/docs/jh/topics/build_your_application/"}
GitLab CI/CD: 使用 CI/CD 构建您的应用程序
::

::note{icon="i-lucide-book" to="https://developer.work.weixin.qq.com/document/path/99110"}
企业微信机器人: 消息推送配置说明
::

## 核心流程

项目的流水线被划分为多个阶段 (Stages)，确保任务按预定顺序执行，完整流程如下：

`notify_start` -> `lint` -> `sonar` -> `build` -> `deploy` -> `notify_end`

- **lint & sonar**: 在合并请求 (Merge Request) 场景下运行，进行代码规范检查和静态质量分析，保障代码质量。
- **build & deploy**: 在推送到 `dev` 或 `master` 分支，或手动触发时执行，完成应用的构建和部署。

::code-preview
  ::tabs

    :::tabs-item{label="发起合并请求" icon="i-lucide-git-pull-request"}
    ![发起合并请求](/images/guides/platforms/gitlab-ci/merge-request-start.png)
    :::

    :::tabs-item{label="合并请求流水线" icon="i-lucide-workflow"}
    ![合并请求流水线](/images/guides/platforms/gitlab-ci/merge-request-workflow.png)
    :::

    :::tabs-item{label="build-deploy 流水线" icon="i-lucide-chart-network"}
    ![build-deploy 流水线](/images/guides/platforms/gitlab-ci/build-deploy-workflow.png)
    :::

  ::
::

## 配置详解

### CI/CD 文件结构

```md
.
├── .gitlab-ci.yml       # 主配置文件，定义 stages, workflow, variables, include 规则
├── .gitlab-dev.yml      # dev 环境的作业 (build, deploy, notify)
├── .gitlab-prod.yml     # prod 环境的作业 (build, notify)
└── scripts/
    └── ci/
        ├── package-zip.sh     # 打包构建产物为 .zip 并生成环境变量
        ├── deploy-zip.sh      # 部署 .zip 包到目标服务器
        └── wechat-notify.js   # 发送企业微信通知
```

::code-tree{defaultValue=".gitlab-ci.yml" expand-all}

```yaml [.gitlab-ci.yml]
# 全局规则：只在指定分支或合并到指定分支的请求中运行
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
    - if: $CI_PIPELINE_SOURCE == "push" && ($CI_COMMIT_BRANCH == "dev" || $CI_COMMIT_BRANCH == "master")
      when: always
    - if: $CI_PIPELINE_SOURCE == "web"
      when: always
    - when: never

# 定义流水线的阶段
stages:
  - notify_start
  - lint
  - sonar
  - build
  - deploy
  - notify_end

# 定义变量
variables:
  NODE_VERSION: lts
  PNPM_VERSION: latest
  GIT_DEPTH: 0
  GIT_STRATEGY: clone
  BUILD_ENV:
    value: dev
    options:
      - dev
      - prod
    description: 选择构建环境（dev/prod）
  SONAR_HOST_URL: # SonarQube 主机地址（自定义）
    value: 'http://10.0.0.100:9000'
    description: SonarQube主机地址
  WECHAT_WEBHOOK_URL: # 企业微信webhook地址，用于通知（自定义）
    value: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-webhook-key-here'
    description: 企业微信webhook地址
  BUILD_DIR: # 构建目录（自定义）
    value: app-gen/dist/web/your-app-name
    description: 构建目录
  DEPLOY_HOST: # 测试部署主机（一般固定，无需修改）
    value: 10.0.0.100
    description: 测试部署主机
  DEPLOY_DIR: # 测试部署目录（自定义）
    value: /home/user/nginx/html/
    description: 测试部署目录

default:
  image: node:${NODE_VERSION}
  tags:
    - sonarqube

include:
  - local: .gitlab-dev.yml
    rules:
      - if: $CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == "dev"
      - if: $CI_PIPELINE_SOURCE == "web" && $BUILD_ENV == "dev"
  - local: .gitlab-prod.yml
    rules:
      - if: $CI_PIPELINE_SOURCE == "web" && $BUILD_ENV == "prod"

# 代码检查作业
lint:
  stage: lint
  script:
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm eslint 'app/**/*.{ts,tsx,vue}'
  artifacts:
    when: always
    reports:
      junit: .eslintcache
    paths:
      - .eslintcache
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  allow_failure: true

# SonarQube 代码分析
sonarqube-check:
  stage: sonar
  image: openjdk:11-jre-slim
  variables:
    SONAR_PROJECT_KEY: ${CI_PROJECT_ID}
    SONAR_PROJECT_NAME: ${CI_PROJECT_TITLE}
    SONAR_PROJECT_VERSION: ${CI_COMMIT_SHORT_SHA}
    SONAR_USER_HOME: '${CI_PROJECT_DIR}/.sonar'
    SONAR_SCANNER_VERSION: 4.6.2.2472
  cache:
    key: 'sonarqube-${SONAR_SCANNER_VERSION}'
    paths:
      - .sonar/cache
      - sonar-scanner/
  before_script:
    - echo "准备 SonarScanner CLI ${SONAR_SCANNER_VERSION}..."
    - |
      if [ ! -d "sonar-scanner" ]; then
        echo "下载并安装 SonarScanner CLI..."
        apt-get update && apt-get install -y wget unzip
        wget -O sonar-scanner.zip "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip"
        unzip sonar-scanner.zip
        mv sonar-scanner-${SONAR_SCANNER_VERSION}-linux sonar-scanner
      else
        echo "使用缓存的 SonarScanner CLI..."
      fi
    - export PATH="$PWD/sonar-scanner/bin:$PATH"
  script:
    - echo "运行测试并生成覆盖率报告..."
    - export PATH="$PWD/sonar-scanner/bin:$PATH"
    - |
      sonar-scanner \
        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        -Dsonar.projectName="${SONAR_PROJECT_NAME}" \
        -Dsonar.projectVersion=${SONAR_PROJECT_VERSION} \
        -Dsonar.host.url=${SONAR_HOST_URL} \
        -Dsonar.login=${SONAR_TOKEN}
  allow_failure: true
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

# 流水线开始通知
notify-start:
  stage: notify_start
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - node scripts/ci/wechat-notify.js --label "${CI_MERGE_REQUEST_TITLE}" --type CI-start
  when: on_success

# 流水线结束通知成功
notify-end-success:
  stage: notify_end
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - node scripts/ci/wechat-notify.js --label "${CI_MERGE_REQUEST_TITLE}" --type CI-end --success
  when: on_success

# 流水线结束通知失败
notify-end-failed:
  stage: notify_end
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - node scripts/ci/wechat-notify.js --label "${CI_MERGE_REQUEST_TITLE}" --type CI-end --failed
  when: on_failure
```

```yaml [.gitlab-dev.yml]
# dev 环境作业定义（通过根 .gitlab-ci.yml 的 include.rules 条件加载）

# 构建作业
build:
  stage: build
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm run build:dev
  script:
    - bash scripts/ci/package-zip.sh
  artifacts:
    paths:
      - '*.zip'
    reports:
      dotenv: zip.env
    expire_in: 1 week

# 部署作业
deploy:
  stage: deploy
  needs:
    - job: build
      artifacts: true
  variables:
    DEPLOY_PORT: 22
    DEPLOY_USER: root
    DEPLOY_PASSWORD: your-password-here
  script:
    - bash scripts/ci/deploy-zip.sh
  when: on_success

notify-deploy-start:
  stage: notify_start
  script:
    - node scripts/ci/wechat-notify.js --label "测试环境部署开始" --type deploy-start
  when: on_success

notify-deploy-end-success:
  stage: notify_end
  needs:
    - job: build
      artifacts: true
    - job: deploy
  script:
    - node scripts/ci/wechat-notify.js --label "测试环境部署 <font color=\"info\">成功</font> 🎉" --type deploy-end
  when: on_success

notify-deploy-end-failed:
  stage: notify_end
  script:
    - node scripts/ci/wechat-notify.js --label "测试环境部署 <font color=\"warning\">失败</font> 😭" --type deploy-end
  when: on_failure
```

```yaml [.gitlab-prod.yml]
# prod 环境作业定义（通过根 .gitlab-ci.yml 的 include.rules 条件加载）

# 构建作业
build:
  stage: build
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm run build
  script:
    - bash scripts/ci/package-zip.sh
  artifacts:
    paths:
      - '*.zip'
    reports:
      dotenv: zip.env
    expire_in: 1 week

notify-deploy-start:
  stage: notify_start
  script:
    - node scripts/ci/wechat-notify.js --label "正式环境打包开始" --type deploy:prod-start
  when: on_success

notify-deploy-end-success:
  stage: notify_end
  needs:
    - job: build
      artifacts: true
  script:
    - node scripts/ci/wechat-notify.js --label "正式环境打包 <font color=\"info\">成功</font> 🎉" --type deploy:prod-end
  when: on_success

notify-deploy-end-failed:
  stage: notify_end
  script:
    - node scripts/ci/wechat-notify.js --label "正式环境打包 <font color=\"warning\">失败</font> 😭" --type deploy:prod-end
  when: on_failure
```

```sh [scripts/ci/deploy-zip.sh]
#!/usr/bin/env bash
set -euo pipefail

# required envs
for v in CI_PROJECT_DIR DEPLOY_HOST DEPLOY_DIR DEPLOY_USER DEPLOY_PASSWORD; do
  if [ -z "${!v:-}" ]; then
    echo "[deploy-zip] missing env: $v" >&2
    exit 1
  fi
done

DEPLOY_PORT="${DEPLOY_PORT:-22}"

# determine zip file
if [ -z "${ZIP_FILE:-}" ]; then
  if [ -z "${BUILD_DIR:-}" ]; then
    echo "[deploy-zip] ZIP_FILE and BUILD_DIR both unset" >&2
    exit 1
  fi
  ZIP_BASENAME="$(basename "$BUILD_DIR")"
  ZIP_FILE="${ZIP_BASENAME}.zip"
fi

cd "$CI_PROJECT_DIR"
if [ ! -f "$ZIP_FILE" ]; then
  echo "[deploy-zip] ZIP_FILE not found: $ZIP_FILE" >&2
  ls -la
  exit 1
fi

# askpass for non-interactive ssh/scp
mkdir -p /tmp
echo '#!/bin/sh' > /tmp/askpass.sh && echo 'echo "$DEPLOY_PASSWORD"' >> /tmp/askpass.sh && chmod +x /tmp/askpass.sh
export SSH_ASKPASS=/tmp/askpass.sh
export DISPLAY=:0

SSH_OPTS="-p ${DEPLOY_PORT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=no"

# ensure remote dir exists
setsid ssh $SSH_OPTS "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_DIR}'"

# upload zip
setsid scp -P "${DEPLOY_PORT}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=no \
  "$ZIP_FILE" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}/"

# unzip remotely and optional cleanup
setsid ssh $SSH_OPTS "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "cd '${DEPLOY_DIR}' && (command -v unzip >/dev/null 2>&1 || (apt-get update && apt-get install -y unzip || yum install -y unzip || true)) && unzip -o '${ZIP_FILE}' -d '${DEPLOY_DIR}' && rm -f '${ZIP_FILE}'"

echo "[deploy-zip] deployed $ZIP_FILE to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}"
```

```sh [scripts/ci/package-zip.sh]
#!/usr/bin/env bash
set -euo pipefail

# required envs
for v in BUILD_DIR CI_PROJECT_DIR CI_PROJECT_ID CI_SERVER_URL CI_JOB_ID; do
  if [ -z "${!v:-}" ]; then
    echo "[package-zip] missing env: $v" >&2
    exit 1
  fi
done

# ensure zip exists (install once if missing)
if ! command -v zip >/dev/null 2>&1; then
  apt-get update && apt-get install -y zip && rm -rf /var/lib/apt/lists/*
fi

ZIP_BASENAME="$(basename "$BUILD_DIR")"
ZIP_FILE="${ZIP_BASENAME}.zip"

cd "$(dirname "$BUILD_DIR")"
zip -rq "$CI_PROJECT_DIR/$ZIP_FILE" "$ZIP_BASENAME"

cat > "$CI_PROJECT_DIR/zip.env" <<EOF
ZIP_BASENAME=$ZIP_BASENAME
ZIP_FILE=$ZIP_FILE
ZIP_ARTIFACT_JOB_ID=$CI_JOB_ID
ZIP_ARTIFACT_URL=$CI_SERVER_URL/api/v4/projects/$CI_PROJECT_ID/jobs/$CI_JOB_ID/artifacts/$ZIP_FILE
EOF

echo "[package-zip] created $CI_PROJECT_DIR/$ZIP_FILE"
```

```js [scripts/ci/wechat-notify.js]
#!/usr/bin/env node
// 企业微信群机器人通知脚本（参考 https://developer.work.weixin.qq.com/document/path/99110 ）

const args = process.argv.slice(2)

function parseArgs(argv) {
  const result = { type: '', label: '', success: false, failed: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--type')
      result.type = argv[++i]
    else if (a === '--label')
      result.label = argv[++i]
    else if (a === '--success')
      result.success = true
    else if (a === '--failed')
      result.failed = true
  }
  return result
}

function formatShanghai(date) {
  const d = date instanceof Date ? date : new Date(date)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = type => parts.find(p => p.type === type)?.value || '00'
  const yyyy = get('year')
  const MM = get('month')
  const dd = get('day')
  const HH = get('hour')
  const mm = get('minute')
  const ss = get('second')
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
}

function formatHMS(totalSeconds) {
  const pad = n => String(n).padStart(2, '0')
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = pad(Math.floor(s / 3600))
  const mm = pad(Math.floor((s % 3600) / 60))
  const ss = pad(s % 60)
  return `${hh}:${mm}:${ss}`
}

async function send(payload) {
  const url = process.env.WECHAT_WEBHOOK_URL
  if (!url) {
    console.log('[wechat-notify] WECHAT_WEBHOOK_URL not set, skip sending.')
    return { skipped: true }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    console.log('[wechat-notify] response:', res.status, text)
    return { status: res.status, body: text }
  }
  catch (e) {
    console.error('[wechat-notify] error:', e && e.message ? e.message : e)
    return { error: true }
  }
}

function buildContentMarkdown({ type, label, success, failed }) {
  const CI_MERGE_REQUEST_PROJECT_URL = `${process.env.CI_MERGE_REQUEST_PROJECT_URL}/-/merge_requests/${process.env.CI_MERGE_REQUEST_IID}`
  const DEPLOY_HOST = process.env.DEPLOY_HOST
  const DEPLOY_DIR = process.env.DEPLOY_DIR
  const BUILD_DIR = process.env.BUILD_DIR
  const ZIP_ARTIFACT_URL = process.env.ZIP_ARTIFACT_URL

  // 提交者
  const author = (process.env.GITLAB_USER_NAME || '').trim()
  // 审核者
  const reviewers = author === '张三' ? 'reviewer1' : 'reviewer2'

  // 选择 @ 成员（即 userid）
  const authorMap = {
    张三: 'zhang.san',
    李四: 'li.si',
    王五: 'wang.wu',
    赵六: 'zhao.liu',
    孙七: 'sun.qi',
    周八: 'zhou.ba',
  }

  // 时间计算
  const startISO = process.env.CI_PIPELINE_CREATED_AT || new Date().toISOString()
  const start = new Date(startISO)
  const now = new Date()
  const elapsedSec = (now - start) / 1000

  // 状态处理（失败优先）
  const isFailed = !!failed
  const isSuccess = !!success && !failed

  // 标题与基础信息
  const title = `<font color="info">【${process.env.CI_PROJECT_TITLE}】</font> ${label}`
  const lines = []
  lines.push(title)

  // 公共信息区块
  lines.push(`> 提交者：<font color="comment">${author}</font>`)

  // 类型分支逻辑
  if (type === 'CI-start') {
    lines.push(`> 开始时间：<font color="comment">${formatShanghai(start)}</font>`)
    lines.push(`<@${reviewers}> [查看合并请求](${CI_MERGE_REQUEST_PROJECT_URL})`)
  }
  else if (type === 'CI-end') {
    lines.push(`> 开始-结束时间：<font color="comment">${formatShanghai(start)} 至 ${formatShanghai(now)}</font>`)
    lines.push(`> 总耗时：<font color="comment">${formatHMS(elapsedSec)}</font>`)
    if (isSuccess) {
      lines.push(`> 状态：<font color="info">成功</font> 🎉`)
      lines.push(`<@${reviewers}> [查看合并请求](${CI_MERGE_REQUEST_PROJECT_URL})`)
    }
    else if (isFailed) {
      lines.push(`> 状态：<font color="warning">失败</font> 😭`)
      lines.push(`<@${authorMap[author]}> <@${reviewers}> [查看合并请求](${CI_MERGE_REQUEST_PROJECT_URL})`)
    }
  }
  else if (type === 'deploy-start') {
    lines.push(`> 开始时间：<font color="comment">${formatShanghai(start)}</font>`)
    lines.push(`> 打包目录：<font color="comment">${BUILD_DIR}</font>`)
    lines.push(`> 目标主机：<font color="comment">${DEPLOY_HOST}</font>`)
    lines.push(`> 目标目录：<font color="comment">${DEPLOY_DIR}</font>`)
  }
  else if (type === 'deploy-end' || type === 'deploy:prod-end') {
    lines.push(`> 开始-结束时间：<font color="comment">${formatShanghai(start)} 至 ${formatShanghai(now)}</font>`)
    lines.push(`> 总耗时：<font color="comment">${formatHMS(elapsedSec)}</font>`)
    if (ZIP_ARTIFACT_URL) {
      lines.push(`> [下载部署包](${ZIP_ARTIFACT_URL})`)
    }
    else {
      lines.push(`<@${authorMap[author]}> <@${reviewers}>`)
    }
  }
  else if (type === 'deploy:prod-start') {
    lines.push(`> 开始时间：<font color="comment">${formatShanghai(start)}</font>`)
    lines.push(`> 打包目录：<font color="comment">${BUILD_DIR}</font>`)
  }
  lines.push(`> [查看流水线](${process.env.CI_PIPELINE_URL})`)

  return lines.join('\n')
}

async function main() {
  const { type, label, success, failed } = parseArgs(args)
  if (!type) {
    console.log('[wechat-notify] no --type provided, skip.')
    return
  }
  const md = buildContentMarkdown({ type, label, success, failed })
  await send({ msgtype: 'markdown', markdown: { content: md } })
}

main().catch((e) => {
  console.error('[wechat-notify] unexpected error:', e)
}).finally(() => {
  // 不阻塞流水线
  process.exit(0)
})
```

::

::tip

为了隔离不同环境的构建逻辑，采用了多脚本和动态配置的策略。

- **构建脚本分离**: `package.json` 中定义了两个构建脚本：
  - `build`: 用于 `prod` 环境，执行生产环境的完整构建。
  - `build:dev`: 用于 `dev` 环境，执行测试环境的特定构建。
- **动态加载配置**: `.gitlab-ci.yml` 会根据 `$BUILD_ENV` 变量的值，通过 `include` 规则动态加载 `.gitlab-dev.yml` 或 `.gitlab-prod.yml`，从而执行对应环境的作业。

::

### 全局环境变量

| 变量名                 | 用途                               |
| :------------------- | :--------------------------------- |
| `BUILD_ENV`          | 控制构建环境 (`dev`/`prod`)，流水线自动或手动选择        |
| `BUILD_DIR`          | 指定构建产物的输出目录，根据项目调整            |
| `SONAR_HOST_URL`     | SonarQube 服务器地址               |
| `WECHAT_WEBHOOK_URL` | 企业微信 WebHook地址，用于通知        |
| `DEPLOY_HOST`        | 部署目标服务器 IP 地址             |
| `DEPLOY_DIR`         | 部署到服务器上的目标目录           |

::warning
`BUILD_DIR` 等变量需要根据不同项目进行修改，请确保其指向正确的构建产物目录。
::

### 企业微信通知

流水线的关键节点会通过企业微信机器人发送实时通知。

- **通知脚本**: `scripts/ci/wechat-notify.js` 负责组装消息内容并发送。
- **@ 成员**: 在消息中可以使用 `<@userid>` 的语法来提及指定成员，请确保填入的是成员的**账号 (userid)**，而不是手机号或姓名。

![ci 开始通知](/images/guides/platforms/gitlab-ci/ci-start-notify.png)
![部署成功通知](/images/guides/platforms/gitlab-ci/deploy-end-success-notify.png)

## 手动执行流水线

除了自动化触发，你也可以手动运行流水线，并指定构建环境或者其他定义的全局变量。

1. 进入项目的 `构建` -> `流水线` 页面。
2. 点击 `运行流水线` 按钮。
3. 选择对应分支，在 `变量` 区域，`BUILD_ENV` 变量会提供一个下拉框，你可以选择 `dev` 或 `prod` 环境。

![手动运行流水线](/images/guides/platforms/gitlab-ci/manual-run-pipeline.png)

## 常见问题 (FAQ)

::code-preview
  ::accordion

    :::accordion-item{label="CI 脚本报错 `No such file or directory`，找不到构建产物目录？" icon="i-lucide-circle-help"}
    这是因为 `.gitlab-ci.yml` 中的 `BUILD_DIR` 变量被配置为了**绝对路径** (例如 `/app/dist/...`)。
      ::note
      CI Runner 的工作目录是 `$CI_PROJECT_DIR`，构建产物路径应该是相对于该目录的**相对路径**。
      ::

    解决方案:

    修改 `.gitlab-ci.yml` 中的 `BUILD_DIR` 变量，将其改为**相对路径** (例如 `app/dist/...`)。
    :::

    :::accordion-item{label="部署成功通知 (`notify-deploy-end-success`) 为什么在部署完成前就发送了？" icon="i-lucide-circle-help"}
    因为该通知作业的 `needs` 依赖中只包含了 `build` 作业，而没有包含 `deploy` 作业，导致它在 `build` 完成后就立即执行。
    :::

    :::accordion-item{label="为什么合并到 `dev` 分支的 Merge Request 没有触发 `dev` 环境的构建和部署流程？" icon="i-lucide-circle-help"}
    因为 `.gitlab-dev.yml` 的 `include` 规则依赖于 `$BUILD_ENV` 变量，但在自动触发的 MR 流水线中，定义在 `.gitlab-ci.yml` 文件内部的 `variables` **在 `include` 解析阶段是不可用的**。
    :::

    :::accordion-item{label="部署时，服务器上只出现了 `dist` 目录里的文件，而没有包含父文件夹？" icon="i-lucide-circle-help"}
    这是因为部署脚本中的 `scp` 命令源路径使用了 `.../.` 结尾，这表示只复制目录的**内容**，而不是目录本身。
    :::

    :::accordion-item{label="`build` 或 `deploy` 失败后，为什么收不到失败通知？" icon="i-lucide-circle-help"}
    因为失败通知作业 (`notify-deploy-end-failed`) 的 `needs` 依赖了上游作业。一旦上游作业失败，该通知作业自身会被 GitLab 跳过 (skipped)。
    :::

    :::accordion-item{label="企业微信通知中的 `@` 为什么不生效？" icon="i-lucide-circle-help"}
    企业微信的 Markdown 消息中，`@` 成员有严格的语法要求。
    :::

  ::
::
