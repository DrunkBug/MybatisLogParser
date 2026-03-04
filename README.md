# MyBatis 日志解析器

这是一个基于 React 的 Web 应用，用于解析和格式化 MyBatis SQL 日志。  
它可以从 MyBatis 日志中提取 SQL 语句和参数，并生成可执行且格式化后的 SQL。

## 功能特性

- 解析 MyBatis 日志格式，提取带占位符的 SQL 语句
- 根据参数类型替换 SQL 中的 `?` 占位符
- 使用 `sql-formatter` 对 SQL 进行格式化，提升可读性
- 使用 `react-syntax-highlighter` 进行 SQL 语法高亮
- 支持一键自动粘贴、解析并复制格式化 SQL
- 支持手动解析与清空内容
- 使用 Tailwind CSS 与轻量可复用 UI 组件，适配响应式布局

## 技术栈

- **前端框架**：React（v19.0.0）
- **UI 组件**：Radix Slot + 自定义基础组件（Button/Card/Alert/Textarea）
- **样式方案**：Tailwind CSS（v3.4.17）+ PostCSS（v8.4.49）+ Autoprefixer（v10.4.20）
- **SQL 处理**：sql-formatter（v15.6.5）
- **代码高亮**：react-syntax-highlighter（v15.6.1）
- **构建工具**：react-scripts（v5.0.1）

## 项目结构

```text
MybatisLogParser/
├── public/                 # 静态资源与 HTML 模板
├── src/
│   ├── components/         # React 组件
│   │   ├── mybatis-log-parser.tsx  # 主业务组件
│   │   └── ui/             # 可复用 UI 原子组件
│   ├── lib/                # 工具函数
│   └── index.js            # 应用入口
├── package.json            # 依赖与脚本
├── tailwind.config.js      # Tailwind 配置
├── postcss.config.js       # PostCSS 配置
├── Dockerfile              # 容器构建与运行定义
└── docker-compose.yml      # 容器编排配置
```

## 可用脚本

在项目根目录可执行以下命令：

### `pnpm start`

启动开发模式。  
浏览器访问 [http://localhost:3000](http://localhost:3000) 查看页面。

修改代码后页面会自动刷新。  
控制台会输出编译或 lint 信息。

### `pnpm test`

运行测试（默认 watch 模式）。

### `pnpm build`

构建生产版本到 `build` 目录。  
构建产物会压缩并带有 hash 文件名，可直接部署。

## Docker 镜像构建（GitHub Actions + GHCR）

仓库内置工作流：`.github/workflows/docker-image.yml`。

- 推送到 `main`/`master` 或发布如 `v1.0.0` 的 tag 时，会自动构建并推送镜像到 `ghcr.io`
- 向 `main`/`master` 发起 PR 时，仅执行 Docker 构建校验，不推送镜像

镜像命名规则：

```text
ghcr.io/<owner>/<repo>
```

本仓库镜像名示例：

```text
ghcr.io/drunkbug/mybatislogparser
```

## 使用 docker-compose 部署

1. 准备环境变量文件：

```bash
cp .env.example .env
```

2. 在目标服务器登录 GHCR：

```bash
echo "<GHCR_PAT>" | docker login ghcr.io -u "<github-username>" --password-stdin
```

3. 拉取并启动服务：

```bash
docker compose pull
docker compose up -d
```

4. 检查服务状态：

```bash
docker compose ps
curl -f http://127.0.0.1:${HTTP_PORT:-3003}/healthz
```

应用默认暴露在 `127.0.0.1:${HTTP_PORT}`（默认端口 `3003`）。

## 使用说明

1. 复制包含 SQL 的 MyBatis 日志
2. 点击“自动粘贴解析”，自动读取剪贴板并解析 SQL
3. 格式化后的 SQL 会显示在右侧结果区域并带语法高亮
4. 点击“复制 SQL”将结果复制到剪贴板
5. 点击“清空”重置输入与输出

## 配置说明

- 基于 Tailwind CSS 的主题与样式变量
- `sql-formatter` 使用 `mysql` 语言配置进行格式化
- 启用剪贴板读写，优化日志处理流程
