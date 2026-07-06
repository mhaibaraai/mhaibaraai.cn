---
title: 自建服务器 GitHub OAuth 回调 500 排查
description: 汇总自建 Docker + nginx 环境下 /auth/github 回调返回 500 的三种独立根因——出海代理超时、数据库连接串在构建期被固化、跨 Docker 网络 DNS 解析失败，提供速查表快速定位与逐一修复步骤。
---

## 三种根因速查表

三次报错都发生在同一个回调路径上，但成因完全独立，不要因为报错路径相同就假设是同一个原因——先对照日志证据定位到具体是哪一种：

| 现象特征 | 根因 | 关键证据 | 对应章节 |
|---|---|---|---|
| nginx 返回 500，应用自身日志**没有**任何异常堆栈 | 容器出海请求 GitHub 挂起，被 nginx 超时掐断 | nginx 日志：`upstream timed out (110: Connection timed out)`，路径为 `/auth/github?code=...` | [出海请求超时：容器访问 GitHub 挂起](#出海请求超时容器访问-github-挂起) |
| 应用日志报 `ECONNREFUSED 127.0.0.1:5432` | 数据库连接串在构建期被固化成字面量 | `docker logs`：`connect ECONNREFUSED 127.0.0.1:5432` | [连接串在构建期被固化成字面量](#连接串在构建期被固化成字面量) |
| 应用日志报 `EAI_AGAIN postgres` | 应用容器与数据库容器不在同一个 Docker 网络，DNS 解析不到主机名 | `docker logs`：`getaddrinfo EAI_AGAIN postgres` | [跨 Docker 网络 DNS 解析失败](#跨-docker-网络-dns-解析失败) |

## 出海请求超时：容器访问 GitHub 挂起

本地 `pnpm dev` 走通登录不代表部署到自建服务器（Docker + nginx 反代）上也能走通——这类环境常见一种和数据库、代码都无关的坑：`/auth/github` 回调稳定返回 500，且应用日志里看不到任何异常。

### 现象与根因

`defineOAuthGitHubEventHandler` 的令牌交换与用户信息拉取发生在 `nuxt-auth-utils` 库内部（`$fetch` 依次 POST `github.com/login/oauth/access_token`、GET `api.github.com/user`），不是应用代码手写的 fetch。境内服务器出海链路对 `github.com`/`api.github.com` 这类站点经常不稳定：TCP 三次握手能成功，但完整的 HTTPS 请求会挂起不返回，最终由 nginx 的 `proxy_read_timeout` 先触发，对浏览器返回 500。

::warning
因为是 fetch 挂死超过 nginx 超时才被动断开，而不是应用主动抛异常，`onError` 里的 `console.error` 往往来不及执行——应用日志、Nitro 错误页都看不到任何线索，很容易被误判为代码或环境变量配置问题。真正的诊断依据是 nginx access/error log：`upstream timed out (110: Connection timed out) while reading response header from upstream`，对应请求路径是 `/auth/github?code=...`。
::

### 修复：让容器出站请求走代理

Node 22 的全局 `fetch`（以及 `ofetch`）不会自动读取 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量，需要显式接入。新增一个 Nitro 插件，用 [undici](https://github.com/nodejs/undici) 的 `EnvHttpProxyAgent` 接管全局 dispatcher：

```sh [sh]
pnpm add undici
```

```ts [server/plugins/proxy.ts]
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici'

export default defineNitroPlugin(() => {
  if (!process.env.HTTPS_PROXY && !process.env.HTTP_PROXY)
    return

  setGlobalDispatcher(new EnvHttpProxyAgent({
    headersTimeout: 10_000,
    bodyTimeout: 10_000
  }))
})
```

- `EnvHttpProxyAgent` 自动读取 `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY`，按目标请求的 scheme 逐请求路由，不需要手动解析环境变量。
- 显式设置 `headersTimeout`/`bodyTimeout`（约 10 秒）：即使代理链路本身也偶发异常，也能快速失败落到 `onError` 走干净的重定向，而不是继续挂到 nginx 超时变成一次不可控的 500。
- 未设置 `HTTPS_PROXY`/`HTTP_PROXY` 时函数体直接返回，插件是空操作，本地 `pnpm dev` 不受影响。

`setGlobalDispatcher` 对 Node 内置 undici 的全局 `fetch`、以及 `ofetch`（`nuxt-auth-utils` 内部用它做令牌交换）统一生效；数据库连接走的是 `postgres` 包的原生 TCP/TLS，不经过 undici，不受这次改动影响。

### 光改代码不够：服务器也要有能连上 GitHub 的出口

这段插件只是把「走不走代理」的开关交给了 `HTTPS_PROXY` 环境变量本身，真正让请求连上 GitHub 靠的是服务器侧已经在跑的代理客户端（如 mihomo/clash 系）。这里有两个容易漏掉的点：

::note
如果服务器上已经给 **Docker daemon** 配置过 `HTTP_PROXY`（常见做法是 `/etc/systemd/system/docker.service.d/http-proxy.conf`，用来加速 `docker pull`/`docker build`），**不要以为这样应用容器内部的请求也会走代理**——那只加速 Docker 引擎自身发起的请求，和容器进程内部的出站请求是两条完全独立的链路。
::

1. **代理客户端要监听到容器网络能访问的地址。** mihomo 等工具默认 `allow-lan: false`，只监听 `127.0.0.1`，容器在 Docker 网桥（如 `webnet`）里连不到宿主机的回环地址。需要把 `allow-lan` 改成 `true`（监听 `0.0.0.0`），并用防火墙（ufw/iptables）只放行 Docker 网桥子网访问代理端口，公网网卡上这些端口一律拒绝，避免把代理订阅暴露给公网。
2. **`docker-compose.yml` 给应用容器显式声明代理地址：**

   ```yaml [docker-compose.yml]
   services:
     app:
       extra_hosts:
         - "host.docker.internal:host-gateway"
       environment:
         - HTTPS_PROXY=http://host.docker.internal:7893   # 端口对应代理的 mixed-port
   ```

   用 `extra_hosts: host.docker.internal:host-gateway` 而不是硬编码网桥网关 IP，网络重建后网关 IP 变化也不会失效。

::tip
如果代理客户端的规则表本身按域名分流（比如 `DOMAIN-SUFFIX,github.com,Proxies`），记得确认 `ghcr.io`、`pkg-containers.githubusercontent.com` 是否也在规则里——它们不是 `github.com` 的子域名，不会被通配到，容器化部署里如果还从 GHCR 拉取镜像，遗漏这两条规则会导致这部分流量落回直连，同样可能遇到不稳定问题。
::

### 也考虑过的方案：透明代理

除了显式 `HTTPS_PROXY`，如果代理客户端本身开着 `redir-port` + TLS SNI 嗅探（`sniffer.enable: true`），理论上可以用宿主机 iptables 把容器出站的 443 流量 `REDIRECT` 到 `redir-port`，做到应用完全无感知、零代码改动。实际权衡下来放弃了这条路：iptables 规则要按容器固定 IP 匹配（否则容器重建后 IP 漂移会让规则失效），还要处理和 Docker 自身管理的 nat 表规则的顺序冲突、规则持久化等问题，运维复杂度和可调试性都不如显式 `HTTPS_PROXY`——出了问题容器里 `echo $HTTPS_PROXY` 就能立刻确认是否生效，iptables 规则则只能靠 `iptables -t nat -L` 慢慢排查。如果你的场景更看重零代码改动，透明代理仍然是可行选项，只是需要更细致的运维配套。

### 验证

```sh [sh]
docker exec <container> sh -c 'echo $HTTPS_PROXY'   # 确认环境变量注入生效
```

走一遍真实的 GitHub 登录，确认 `/auth/github` 回调不再挂起超时；观察 nginx 日志确认不再出现 `upstream timed out ... /auth/github` 记录。

## 连接串在构建期被固化成字面量

解决了出海代理超时之后，同一个 `/auth/github` 回调又以另外两种方式连续报过 500，而且两次都是**确定性失败**（每次报错完全一致，不是网络抖动），和前面的代理问题成因完全不同，容易被合并误判成"还是代理没配好"。两次报错都发生在 `onSuccess` 回调里查 `users` 表这一步——也就是说 GitHub 令牌交换和用户信息拉取其实都已经成功了，`ghUser` 已经拿到手，纯粹是应用连不上自己的数据库。

### 现象

`docker logs` 能看到应用自己打出的异常堆栈（没有被 nginx 吞掉）：

```text
H3Error: Failed query: select ... from "users" ...
  cause: Error: connect ECONNREFUSED 127.0.0.1:5432
```

明明 `docker-compose.yml` 里 `DATABASE_URL` 写的是 `postgresql://user:pass@postgres:5432/db`，运行时却固定连到 `127.0.0.1:5432` 并被拒绝——不是配置写错了，是**根本没有生效**。

### 根因

`@nuxthub/core` 在 `postgres-js` driver、非 dev、非 Cloudflare 托管场景下，会在 Nuxt 构建期读一次 `POSTGRES_URL`/`POSTGRESQL_URL`/`DATABASE_URL`，如果读到的值非空，直接把这个值当**字符串字面量**写死进编译产物（`.output/server` 里生成的 `hub:db` 运行时模块），而不是保留 `process.env.DATABASE_URL` 这种运行时读取的代码。只有构建期这三个变量都为空，产物里才会是运行时读取的写法。

CI 流水线里，`pnpm build` 之前用 SSH 隧道打通了到生产库的连接（`ssh -L 5432:localhost:5432 ...`），并且顺手把 `DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/db`（只在 CI 这台机器、经隧道才有效的地址）设进了同一个 `Build` 步骤的 `env`，本意是让 `applyMigrationsDuringBuild`（默认开启）能在构建时顺便把 migration 跑了。副作用是这个只在 CI 里临时有效的 `127.0.0.1:5432`，被当成"构建期已知的生产连接串"永久烧进了镜像，运行时容器里 docker-compose 传入的正确 `DATABASE_URL` 被完全无视。

### 修复

把"跑 migration"和"编译"彻底拆开，`Build` 步骤不再感知 `DATABASE_URL`：

```yaml [.github/workflows/deploy.yml]
- name: Run database migrations
  env:
    DATABASE_URL: postgresql://${{ secrets.DB_USER }}:${{ secrets.DB_PASSWORD }}@127.0.0.1:5432/${{ secrets.DB_NAME }}
  run: pnpm db:migrate   # 对应 nuxt db migrate，独立命令，不牵扯 nuxt build

- name: Build
  env:
    NUXT_SESSION_PASSWORD: ${{ secrets.NUXT_SESSION_PASSWORD }}
    # 不再设置 DATABASE_URL
  run: pnpm build
```

::tip
本地验证这条修复时，`pnpm build` 很容易被本机 `.env` 里为 `pnpm dev` 准备的 `DATABASE_URL` 悄悄污染，得出"还是被固化了"的假阳性结论。用 `nuxi build --dotenv=/一个不存在的路径` 可以让本次构建完全不读 `.env`，模拟 CI 干净环境，再检查产物里的 `hub:db` 模块是不是 `process.env.DATABASE_URL` 这种运行时读取写法。
::

## 跨 Docker 网络 DNS 解析失败

### 现象

修复上一阶段并重新部署后，`ECONNREFUSED 127.0.0.1:5432` 消失，变成另一个同样确定性的报错：

```text
cause: Error: getaddrinfo EAI_AGAIN postgres
  code: 'EAI_AGAIN', syscall: 'getaddrinfo', hostname: 'postgres'
```

`DATABASE_URL` 这次确实是运行时读取的、指向 `postgres:5432` 了（上一阶段修复生效），但容器内解析不出 `postgres` 这个主机名。

### 根因

`docker inspect` 两个容器的网络信息就能直接看出问题：

```sh [sh]
docker inspect postgres     --format '{{json .NetworkSettings.Networks}}'
# → 网络 database_default（另一份独立的 docker-compose.yml 管理 postgres/redis/mongodb，
#    用 `networks: default: name: database_default` 显式命名）

docker inspect movk-studio  --format '{{json .NetworkSettings.Networks}}'
# → 网络 webnet（应用栈那份 compose 文件，`webnet: external: true`）
```

两个容器分别属于两个互不相交的 Docker 用户自定义网络。Docker 内置 DNS 只在**同一个**用户自定义网络内的容器之间生效，不同网络之间即使在同一台宿主机上也互相解析不到——这和 CI 里 SSH 隧道能连通（那是从宿主机自身的回环地址访问，走的是端口发布，完全不经过容器间网络）是两条不相干的链路，此前 SSH 隧道迁移一直正常，恰恰说明和网络本身的连通性无关，纯粹是 DNS 解析不到。

### 修复

给应用容器所在的 compose 服务追加数据库所在的网络，两边都声明成 `external: true`（各自由对方那份 compose 文件创建，谁也不属于当前这份文件）：

```yaml [docker-compose.yml]
services:
  movk-studio:
    # ...
    networks:
      - webnet
      - database_default   # 新增

networks:
  webnet:
    external: true
  database_default:        # 新增：引用另一份 compose 文件里 name: database_default 出来的网络
    external: true
```

一个容器可以同时属于多个 Docker 网络，只需要改动需要访问数据库的这一个服务，其余纯前端服务不用动。改完执行 `docker compose up -d movk-studio` 让 Compose 检测到网络变化并重建这一个容器（不影响同 compose 文件里的其他服务）。

::tip
不改 compose 文件、只想立刻验证的话，可以先对正在运行的容器执行 `docker network connect database_default movk-studio` 临时接入网络，无需重启，缺点是下次容器被重建（比如 watchtower 拉新镜像）后这个临时连接会丢失，必须把改动落回 compose 文件才能长期生效。
::

### 验证

```sh [sh]
docker inspect movk-studio --format '{{json .NetworkSettings.Networks}}'
# 应该同时看到 webnet 和 database_default 两个网络

docker exec movk-studio getent hosts postgres
# 应该能解析出 database_default 网络里 postgres 的内网 IP
```

再走一遍真实 GitHub 登录，`docker logs movk-studio` 里不应再出现 `ECONNREFUSED` 或 `EAI_AGAIN`。

::note
三种根因相互独立：出海代理解决的是容器访问 `github.com`/`api.github.com` 这类公网出海请求，后两种数据库连通性问题走的是宿主机内网。同一个回调路由报过一次 500，不代表下一次也是同一个原因——按本文开头的速查表逐条核对日志证据，而不是直接套用上一次的修复方案。
::
