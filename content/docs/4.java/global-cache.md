---
title: 全局依赖缓存位置
description: 说明 Maven 与 Gradle 全局依赖缓存位置
---

## 全局依赖缓存位置

### Maven
- 路径：`~/.m2/repository`
- 按 `groupId/artifactId/version` 目录结构存放 JAR 文件
- 配置文件位置：`~/.m2/settings.xml`，可通过 `<localRepository>` 自定义存储路径
- 示例：`~/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.1.0/`

### Gradle
- 路径：`~/.gradle/caches/modules-2/files-2.1/`
- 使用哈希目录存储
- 可通过 `GRADLE_USER_HOME` 修改缓存位置
- 示例：`~/.gradle/caches/modules-2/files-2.1/org.springframework.boot/spring-boot-starter-web/3.1.0/xxxx.jar`

::note
IntelliJ IDEA 不会额外保存依赖，所有依赖来自 Maven 或 Gradle 缓存；项目本地 `libs` 目录中的 JAR 为私有依赖，不会进入全局缓存。
::
