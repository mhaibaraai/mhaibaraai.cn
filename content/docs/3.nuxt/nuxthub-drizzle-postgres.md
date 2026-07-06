---
title: NuxtHub + Drizzle ORM 数据库集成
description: 在 Nuxt 项目中通过 hub:db 接入 Drizzle ORM，讲清 schema、migrations 的工作原理，对比 SQLite 与 PostgreSQL 选型，覆盖 Vercel、Docker 自建服务器两种部署下的数据库配置方式，并端到端验证一次 GitHub OAuth 登录。
links:
  - label: Drizzle ORM
    icon: i-simple-icons-drizzle
    to: https://orm.drizzle.team/
    target: _blank
  - label: NuxtHub
    icon: i-simple-icons-nuxt
    to: https://hub.nuxt.com/
    target: _blank
---

::note
本文讲的是**应用层**——Nuxt 项目如何通过 NuxtHub 接入 Drizzle ORM。PostgreSQL/Redis 本身用 Docker Compose 部署、通过 SSH 隧道安全连接的基础设施部分，见「数据库部署」一文，这里不重复。
::

## NuxtHub 与 Drizzle ORM 是什么

**[Drizzle ORM](https://orm.drizzle.team/)** 是一个 TypeScript 查询构造器：本质是把方法链编译成 SQL，没有像 Prisma 那样的独立 codegen 引擎；用 `pgTable`/`sqliteTable` 定义表结构后，类型和查询结果自动推导；同时提供贴近原生 SQL 的构造器语法（`db.select().from(table).where(...)`）和关系型查询 API（`db.query.xxx.findFirst()`）。

**[NuxtHub](https://hub.nuxt.com/)**（`@nuxthub/core`）不自己造 ORM，而是把 Drizzle 包装成开箱即用的能力：自动读取 `server/db/schema.ts`、自动管理迁移、并通过虚拟导入 `hub:db` 直接暴露一个配置好的 `db` 实例——省去手写 `drizzle(...)` 连接样板代码的过程。写代码时面对的还是 Drizzle 原生 API，NuxtHub 只负责连接、schema 注册、迁移这套自动化。

## 接入步骤

### 安装依赖

```sh [sh]
npx nuxi module add hub
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

`postgres` 是 `postgres-js` 驱动包，负责建立标准 TCP 连接；如果用 SQLite（本地文件或 Turso），驱动换成 `@libsql/client`。

### nuxt.config.ts

`dialect` 必须显式声明，sqlite 与 postgresql 之间不会自动切换：

::code-group

```ts [postgresql]
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    db: {
      dialect: 'postgresql',
      driver: 'postgres-js'
    }
  }
})
```

```ts [sqlite]
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    db: 'sqlite'
  }
})
```

::

没有写死 `connection`，NuxtHub 会按环境变量优先级自动读取连接串：

| 方言 | 优先级 |
|-----|-------|
| PostgreSQL | `POSTGRES_URL` \> `POSTGRESQL_URL` \> `DATABASE_URL` |
| SQLite / Turso | `TURSO_DATABASE_URL` \> `LIBSQL_URL` \> `DATABASE_URL`，均未设置则落到本地文件 `.data/db/sqlite.db` |

本地开发不设 PostgreSQL 连接串时，会自动 fallback 到 **PGlite**（内嵌 WASM 版 Postgres），行为兼容，不需要额外装本地 Postgres 服务。

### server/db/schema.ts

Schema 必须放在这个约定路径（或拆到 `server/db/schema/` 目录），会被自动扫描注册到 `hub:db` 的 `schema` 对象上：

```ts [server/db/schema.ts]
import { pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  provider: text('provider', { enum: ['github'] }).notNull(),
  providerId: text('provider_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, table => [
  uniqueIndex('users_provider_id_idx').on(table.provider, table.providerId)
])

export const chats = pgTable('chats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, table => [
  index('chats_user_id_idx').on(table.userId)
])

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, { fields: [chats.userId], references: [users.id] })
}))
```

::tip
主键用应用层生成的 `text`（`crypto.randomUUID()`）而不是数据库自增列，是因为插入时经常需要显式指定 `id`（比如把某个已知的会话 ID 当作用户 ID），生成权放在应用层更灵活。
::

### 在服务端路由中使用

```ts [server/api/example.get.ts]
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default eventHandler(async () => {
  return await db.select().from(schema.users).where(eq(schema.users.id, '1'))
})
```

## schema → migrations → 数据库：工作流程原理

这套机制经常让人困惑，核心是分清楚四个角色各自的职责：

```text
server/db/schema.ts                    ← 「想要」的表结构（TS 描述，目标状态，不操作数据库）
        │  nuxt db generate（纯本地 diff，不连数据库）
        ▼
migrations/*.sql                       ← schema 差异翻译出的 SQL 建表/改表语句
migrations/meta/snapshot.json          ← 上次生成迁移时 schema 的快照，供下次 diff 用
migrations/meta/_journal.json          ← 迁移文件的执行顺序清单
        │  nuxt db migrate（这一步才真正连接数据库）
        ▼
真实数据库                              ← 按顺序执行「还没跑过」的 .sql，并在库内建一张
                                          记账表记录已执行的文件名，避免重复执行
        │
        ▼
hub:db（运行时）                        ← 纯连接池 + 类型映射，不参与建表，
import { db, schema } from 'hub:db'      表必须已经被迁移建好它才查得到
```

::steps{level="3"}

### 生成迁移

```sh [sh]
pnpm db:generate
```

对应 `package.json` 里的 `"db:generate": "nuxt db generate"`。这一步是离线操作：拿 `schema.ts` 现在的样子和 `meta/snapshot.json` 记录的「上次生成迁移时」的样子做 diff，把差异写成新的 `.sql` 文件，同时更新快照。因为不连接真实数据库，哪怕没配连接串也能跑通。

### 应用迁移

```sh [sh]
pnpm db:migrate
```

对应 `"db:migrate": "nuxt db migrate"`。这一步才真正连上 `DATABASE_URL` 指向的数据库：检查库里的记账表，把没跑过的迁移文件按顺序执行，再把执行记录写回记账表。这样同一份迁移不会被重复执行，团队协作或多环境部署时表结构演进历史也能保持一致。

::

::warning
`meta/` 目录下的快照和 journal 文件不要手动删除或修改，它们是 `db:generate` 做增量 diff 的依据，删掉会导致下次生成的迁移文件把所有表当成新表重新建一遍。
::

这套流程存在的意义：让「数据库长什么样」这件事有版本历史、可追溯，能在本机、测试服、生产服之间以同样的步骤重放，而不是靠手工在 Navicat 里点点点建表——那样改了什么、什么时候改的，完全没有记录。

## SQLite 与 PostgreSQL 怎么选

| | SQLite（NuxtHub，libsql） | PostgreSQL |
|---|---|---|
| 部署复杂度 | 零外部依赖，本地文件或 Turso 托管 | 需要单独维护一个数据库服务 |
| 并发写入 | 单文件写锁，高并发写入会排队 | 原生支持多连接并发读写 |
| 多副本/横向扩展 | 本地文件方案不支持多副本，要扩展得接 Turso 或自建 `sqld` | 天然支持多个应用实例连同一库 |
| 类型/特性丰富度 | 基础类型为主 | JSON/JSONB、数组、全文检索、`pgvector` 等扩展 |
| 适合场景 | 中小流量、单实例、想少运维一个服务 | 已有成熟 Postgres 基建、需要扩展性或高级特性 |

如果服务器上已经装了 Postgres，直接复用是最省事的路径——不用再考虑 SQLite 文件持久化、卷挂载、单实例写锁这些问题。这不算“Postgres 更优”，而是运维成本已经沉没时的现实选择。

## 部署篇

### Vercel

Vercel 是无状态 serverless，不能写本地文件，数据库要接远程服务：

1. 在项目 **Storage → Marketplace** 添加 **Turso**（SQLite 场景）或直接用托管 Postgres，会自动注入连接所需的环境变量（如 `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`）。
2. NuxtHub 按前文的优先级探测到这些环境变量后自动切换驱动，**代码不用改**。
3. Vercel 在构建阶段就已注入这些环境变量，默认的 `applyMigrationsDuringBuild`（默认开启）会在构建时自动跑迁移；也可以 `vercel env pull` 拉到本地后手动 `pnpm db:migrate`。
4. 如果用到 `hub.blob`，同理在 Storage 里挂一个 Vercel Blob store，自动注入 `BLOB_READ_WRITE_TOKEN`，NuxtHub 自动切到 `vercel-blob` driver。

### GitHub CI + Docker 自建服务器

自建场景的核心问题是：**镜像构建阶段通常拿不到、也不该拿到生产数据库凭证**。所以要显式关掉构建期自动迁移：

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  hub: {
    db: {
      dialect: 'postgresql', // 或 sqlite + driver: 'libsql'
      driver: 'postgres-js',
      applyMigrationsDuringBuild: false,
      applyMigrationsDuringDev: false
    }
  },
  nitro: {
    preset: 'node-server'
  }
})
```

数据库落地方式常见两种：

- **直连服务器上已有的 Postgres**：应用容器和 Postgres 在同一台机器/同一网络，运行时用 `DATABASE_URL=postgresql://user:pass@localhost:5432/db` 直连，不需要额外起数据库服务。
- **本地 SQLite 文件 + 持久化卷**：容器挂一个 volume，`DATABASE_URL=file:/data/sqlite.db`，简单但只适合单实例，多副本会有写冲突。

因为关掉了自动迁移，迁移动作要挪到部署流水线里单独执行（镜像 push 完、应用容器重启前）：

```sh [sh]
docker run --rm --env-file .env.production your-image:latest node_modules/.bin/nuxt db migrate
```

::warning
`applyMigrationsDuringBuild: false` 只是关掉了「构建期缺少连接串就报错」这个检查，**不能**阻止 NuxtHub 把连接串固化进产物——只要构建期 `process.env` 里 `POSTGRES_URL`/`POSTGRESQL_URL`/`DATABASE_URL` 三者之一非空，NuxtHub 对 `postgres-js` driver（非 dev、非 Cloudflare 托管场景）就会把它当字符串字面量写死进编译产物，和这个开关无关。真正要保证的是：**跑 `nuxt build` 的那一刻，构建环境里这三个变量必须全部不存在**，产物里才会保留 `process.env.DATABASE_URL` 这行运行时读取代码。详细踩坑过程见「[自建服务器 GitHub OAuth 回调 500 排查 · 连接串在构建期被固化成字面量](/docs/nuxt/troubleshooting/self-hosted-oauth-500#连接串在构建期被固化成字面量)」。
::

## 连接已有远程 PostgreSQL 的坑

用 Navicat 之类的 GUI 工具能通过 SSH 隧道连上服务器的 Postgres，是因为工具内置了 SSH 客户端，帮你在本机和服务器之间建了隧道，再把流量转发给只监听 `127.0.0.1:5432` 的数据库进程。**应用层的驱动（`postgres`/`@libsql/client`）不会自动建隧道**，本地开发要自己手动开一条：

```sh [sh]
ssh -N -L 5433:localhost:5432 <ssh用户名>@<服务器地址>
```

- `-L 本地端口:目标主机:目标端口`，冒号后面那部分是**从 SSH 服务器的视角**看的，不是本机视角——Postgres 实际监听的是服务器上的 `5432`，写成 `-L 5433:localhost:5433` 这种「本地端口和目标端口对齐」是常见的手误，隧道照样能建立，但转发到了服务器一个没人监听的端口，实际连接时才会报 `connection refused`。
- 本机端口特意避开 `5432`，防止和本机可能装的 Postgres 冲突。
- `-N` 表示只做端口转发不进远程 shell，敲完密码后**终端会一直没有任何输出、卡在那不返回提示符**——这是正常现象，不是卡死，只要没报错断开就说明隧道已经建立并挂在后台，另开一个新终端继续操作即可。
- `.env` 里连接串写本机隧道端口：`DATABASE_URL=postgresql://user:pass@localhost:5433/db`。

三段式拆开看会更清楚每一跳分别落在谁的视角上：

```text
本机 localhost:5433  →  SSH 隧道  →  服务器视角的 localhost:5432  →  Postgres 进程
（应用驱动实际连接的地址）   （加密转发，不经过公网端口）   （-L 冒号右侧写的是这里，不是本机）
```

::tip
另开一个终端用 `lsof -iTCP:5433 -sTCP:LISTEN` 验证隧道是否建立成功，能看到一条 `ssh` 进程占用该端口就说明本地转发端已经就绪。
::

::warning
不要为了省事直接把 Postgres 对公网开放端口，或在 `pg_hba.conf` 里允许任意来源 IP 连接——这是不必要的攻击面。等应用真正部署到同一台服务器上跑起来后，直连 `localhost:5432` 即可，隧道只是本机开发访问远程内网服务的临时手段。
::

新项目建议单独建库、单独建账号，不要和服务器上已有项目共用同一个数据库/账号：

```sql [psql]
CREATE DATABASE movk_studio;
CREATE USER movk_app WITH PASSWORD '<强密码>';
GRANT ALL PRIVILEGES ON DATABASE movk_studio TO movk_app;

-- PostgreSQL 15+ 默认收回了 public schema 的 CREATE 权限，
-- 上面这条只是库级别的授权，还要单独给 public schema 建表权限，
-- 否则跑迁移时会报 permission denied for schema public
\c movk_studio
GRANT USAGE, CREATE ON SCHEMA public TO movk_app;
```

## 常见报错排查

两个报错都发生在跑 migration 或应用第一次建表时，都和 `public` schema 的权限相关，容易混淆，先看区别：

| 报错信息 | 触发场景 | 根本原因 |
|---|---|---|
| `permission denied for schema public` | 连接角色能定位到 `public` schema，但没有 `CREATE` 权限 | PostgreSQL 15+ 默认收回了 `public` schema 的建表权限 |
| `no schema has been selected to create in` | 连接角色的 `search_path` 解析不出任何可用 schema | `public` schema 缺失，或角色 `search_path` 未配置 |

### permission denied for schema public

从 PostgreSQL 15 开始，新建数据库的 `public` schema 默认不再给普通用户 `CREATE` 权限，只有 schema 所有者（通常是建库用的 `postgres` 超级用户）和超级用户能在里面建表。`GRANT ALL PRIVILEGES ON DATABASE` 只到数据库层面，不包含这条。上面「建库」步骤里已经补上了对应的 `GRANT USAGE, CREATE ON SCHEMA public`；如果是已经建好的老库遇到这个报错，直接补跑这一句就行。

不想处理权限的话，`.env` 里 `DATABASE_URL` 直接用 `postgres` 超级用户连接也能绕开——超级用户不受 schema 权限限制，个人项目短期用没问题，只是权限隔离弱一些。

### no schema has been selected to create in

比上面更底层的一种情况：连接角色的 `search_path`（决定不写 schema 名时去哪建表的搜索路径）解析不出可用的 schema。先诊断 `public` 是否存在：

```sql [psql]
SELECT schema_name FROM information_schema.schemata;
```

- 如果有 `public` 但还是报错，通常是权限/`search_path` 没配全：

  ```sql [psql]
  GRANT USAGE, CREATE ON SCHEMA public TO movk_app;
  ALTER ROLE movk_app SET search_path TO public;
  ```

  `ALTER ROLE` 对已经打开的连接不生效，重新执行 `pnpm db:migrate` 建立新连接时才会应用。

- 如果没有 `public`（比如库是从精简模板建的，或者被误删过），建回来：

  ```sql [psql]
  CREATE SCHEMA public;
  GRANT USAGE, CREATE ON SCHEMA public TO movk_app;
  ```

## 端到端验证：走通一次 GitHub 登录

`users`/`chats` 表建出来之后，真正验证「写入」这条链路是否走通，最直接的办法是走一遍 GitHub OAuth 登录——路由文件用到的 `defineOAuthGitHubEventHandler`/`getUserSession`/`setUserSession` 来自 [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)，和数据库配置是两回事，但常常一起踩坑，所以放这里一并记录。

::note
如果项目基于 `@movk/nuxt`，`nuxt-auth-utils` 已经作为依赖内置，不需要额外安装或在 `modules` 里注册，直接用 `defineOAuthGitHubEventHandler` 等全局方法即可。
::

`nuxt-auth-utils` 启动时会检查两个环境变量，缺了会直接报错 `Missing NUXT_OAUTH_GITHUB_CLIENT_ID or NUXT_OAUTH_GITHUB_CLIENT_SECRET env variables`：

::steps{level="3"}

### 创建 GitHub OAuth App

打开 [github.com/settings/applications/new](https://github.com/settings/applications/new)，填：

| 字段 | 值 |
|---|---|
| Homepage URL | `http://localhost:<dev端口>` |
| Authorization callback URL | `http://localhost:<dev端口>/auth/github` |

回调路径固定是 `/auth/github`，对应约定路由文件 `server/routes/auth/github.get.ts`；端口要填你本地实际跑的 dev 端口（默认 `3000`，项目里改过 `--port` 就用改过的那个）。

### 填入环境变量

创建完在 App 详情页拿到 **Client ID**，点 **Generate a new client secret** 生成 **Client Secret**：

```bash [.env]
NUXT_OAUTH_GITHUB_CLIENT_ID=<Client ID>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<Client Secret>
```

环境变量是启动时读取的，改完 `.env` 要重启 `pnpm dev` 才生效。

### 验证写入

走一遍登录流程，回 Navicat 里刷新 `users` 表，能看到插进去的一条记录，说明「登录路由 → Drizzle → PostgreSQL」整条链路都通了。

::
