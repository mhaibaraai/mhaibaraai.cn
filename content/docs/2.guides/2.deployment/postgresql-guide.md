---
title: PostgreSQL 部署
description: 使用 Docker Compose 部署 PostgreSQL
---

::note
本指南使用 Docker Compose v2+ 部署 PostgreSQL。
::

::steps{level=2}

## 创建项目结构

```sh [sh]
mkdir -p ~/postgres-server
cd ~/postgres-server

# 使用 .env 文件存储敏感凭据
touch .env

# Docker Compose v2+ 推荐使用 compose.yml
touch compose.yml
```

## 配置环境变量

将所有敏感信息（如密码、用户名）存储在 `.env` 文件中，可以避免将它们硬编码到配置文件中。

::tip
请务必使用一个难以猜测的强密码替换 `your_very_strong_password`
::

```env [~/postgres-server/.env]
DB_USER=postgres
DB_PASSWORD=your_very_strong_password
DB_NAME=postgres
COMPOSE_PROJECT_NAME=pg_server
```

## 编写 Compose 文件

::code-collapse

```yaml [~/postgres-server/compose.yml]
services:
  database:
    image: postgres:17
    container_name: ${COMPOSE_PROJECT_NAME}-db
    restart: unless-stopped

    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}

    ports:
      - '127.0.0.1:5432:5432'

    volumes:
      - db-data:/var/lib/postgresql/data

    networks:
      - default

volumes:
  db-data:
    name: ${COMPOSE_PROJECT_NAME}-data-volume

networks:
  default:
    name: ${COMPOSE_PROJECT_NAME}-network
```

::

## 启动服务

在 `~/postgres-server` 目录下启动数据库。

```sh [sh]
docker compose up -d
```

## 验证安装

检查容器是否正在运行，并尝试连接到数据库。

```sh [sh]
docker compose ps
docker compose exec database psql -U postgres -d postgres
```

成功连接后，将看到 `postgres=>` 提示符。输入 `\q` 退出。

::

## 添加 PostGIS 支持（用于地图和地理空间操作）

如果项目需要处理地理数据（例如，存储经纬度、计算距离、处理地图瓦片），需要使用带有 PostGIS 扩展的 PostgreSQL 镜像。

```yaml [~/postgres-server/compose.yml]
services:
  database:
    image: postgis/postgis:17-3.4
    # ... 其余配置保持不变 ...
```

重启服务使配置生效

```sh [sh]
docker compose down
docker compose up -d
```

## 在数据库中激活扩展

即使使用了 PostGIS 镜像，仍需要在目标数据库中手动激活扩展。

1. 连接到数据库

   ```sh [sh]
   docker compose exec database psql -U postgres -d postgres
   ```

2. `psql` 提示符后，运行以下 SQL 命令：

   ```sql [sh]
   -- 激活 PostGIS 核心功能
   CREATE EXTENSION postgis;

   -- (可选) 激活拓扑支持
   CREATE EXTENSION postgis_topology;

   -- (可选) 激活栅格数据支持
   CREATE EXTENSION postgis_raster;
   ```

3. **验证安装**

   运行 `\dx` 命令，应该能看到 `postgis` 及其他已安装的扩展。

   ::code-collapse

   ```text
   postgres=> \dx
                                         List of installed extensions
             Name          | Version |   Schema   |                        Description
   ------------------------+---------+------------+------------------------------------------------------------
   fuzzystrmatch          | 1.2     | public     | determine similarities and distance between strings
   plpgsql                | 1.0     | pg_catalog | PL/pgSQL procedural language
   postgis                | 3.5.2   | public     | PostGIS geometry and geography spatial types and functions
   postgis_raster         | 3.5.2   | public     | PostGIS raster types and functions
   postgis_tiger_geocoder | 3.5.2   | tiger      | PostGIS tiger geocoder and reverse geocoder
   postgis_topology       | 3.5.2   | topology   | PostGIS topology spatial types and functions
   (6 rows)

   ```

   ::

现在，PostgreSQL 数据库已完全具备处理地理空间数据的能力。

## 远程连接数据库

当需要使用 Navicat、DBeaver 或其他桌面客户端连接服务器上的数据库时，强烈推荐通过 SSH 隧道进行连接，以确保安全。

在 Navicat 中配置 SSH 隧道：

1. 打开 Navicat，新建一个 PostgreSQL 连接。

2. 在 **“常规”** 选项卡中:
   - **主机**: `localhost` 或 `127.0.0.1` (连接到本地隧道)
   - **端口**: `5432`
   - **初始数据库**: `postgres` (或在 `.env` 中设置的 `DB_NAME`)
   - **用户名**: `postgres` (或 `DB_USER`)
   - **密码**: 在 `.env` 文件中设置的 `DB_PASSWORD`

3. 切换到 **“SSH”** 选项卡，勾选 **“使用 SSH 通道”**:
   - **主机**: 服务器的 **公网 IP 地址** (`your_ipv4_address`)
   - **端口**: `22`
   - **用户名**: `root` (或用于 SSH 登录的用户名)
   - **验证方法**: 选择“密码”并输入 SSH 登录密码，或者选择“公钥”并指定 SSH 私钥文件 (例如 `~/.ssh/id_ed25519`)。

4. 点击 **“连接测试”**。如果信息正确，应会提示连接成功。
