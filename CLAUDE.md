# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

K8s Learning 是一个交互式 Kubernetes 学习网站，帮助用户通过动手实验掌握 Kubernetes 技能。

### 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **终端**: xterm.js
- **代码编辑器**: Monaco Editor
- **K8s 连接**: @kubernetes/client-node

## 常用命令

```bash
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
npm run start  # 启动生产服务器
npm run lint   # 运行 ESLint
```

## Docker 部署

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重新构建
docker-compose up -d --build
```

### Docker 说明
- 使用多阶段构建优化镜像大小
- 使用非 root 用户运行（安全）
- 内置健康检查
- 独立模式部署（standalone output）

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── k8s/
│   │   │   ├── exec/       # 执行 kubectl 命令
│   │   │   ├── deploy/     # 部署 YAML
│   │   │   └── read-local-kubeconfig/  # 读取本地 kubeconfig
│   │   ├── questions/       # 面试题 CRUD API
│   │   ├── scheduler/       # 定时任务管理
│   │   └── sync/            # 数据同步触发
│   ├── cases/               # 生产环境案例
│   ├── interview/           # 面试题模块
│   ├── learn/               # 学习路径
│   │   ├── beginner/        # 初学者路径
│   │   ├── intermediate/    # 进阶路径
│   │   └── advanced/        # 高级路径
│   ├── playground/           # 交互式实验区
│   ├── page.tsx             # 首页
│   └── layout.tsx           # 根布局
├── components/
│   ├── editor/             # YAML 编辑器组件
│   └── terminal/            # K8s 终端组件
└── lib/
    ├── db/                  # 数据存储层
    │   └── index.ts         # JSON 文件数据库
    ├── scrapers/            # 数据爬虫模块
    │   ├── github.ts        # GitHub 爬虫
    │   ├── blogs.ts         # 博客爬虫
    │   └── index.ts         # 爬虫入口 + 去重逻辑
    ├── sync/                # 定时同步模块
    │   └── scheduler.ts     # node-cron 调度器
    └── tutorials/            # 教程数据和组件
data/
└── questions.json           # 面试题数据文件
```

## 核心功能

### 学习路径
- **初学者路径**: K8s概述、Pod基础、Deployment基础、Service基础、Namespace基础
- **进阶路径**: ConfigMap/Secret、Ingress、HPA、PV/PVC
- **高级路径**: Operator开发、网络策略、RBAC、安全上下文、资源配额

### 面试题
- 按分类（基础概念、架构组件、网络、存储、生产实践、安全）和难度筛选
- 点击展开查看完整答案

### 生产案例
- 8个生产级配置案例：Nginx部署、MySQL有状态部署、Ingress HTTPS、HPA自动扩缩容、ConfigMap/Secret配置、网络策略、Pod中断预算、定时任务
- 完整的 YAML 配置和操作步骤

### Playground
- **Kubeconfig 管理**: 支持粘贴、上传文件、检测本地 ~/.kube/config
- **集群信息**: 连接后显示集群名称、上下文、节点数、命名空间数
- **交互式终端**: 命令历史（上下箭头）、Ctrl+C 中断、语法高亮
- **快捷命令**: 一键执行常用 kubectl 命令
- **YAML 部署**: 编辑器 + 一键部署到集群
- **编辑器模式**: Monaco Editor 可视化编辑 / 纯 YAML 源码切换

#### Playground API 路由
- `POST /api/k8s/exec` - 执行 kubectl 命令
- `POST /api/k8s/deploy` - 部署 YAML 到集群
- `GET /api/k8s/read-local-kubeconfig` - 读取本地 kubeconfig

## 开发注意事项

- API 路由使用 `child_process` spawn 执行 kubectl
- Monaco Editor 使用动态导入 (`ssr: false`)
- xterm.js 终端需要 FitAddon 来自适应容器大小
- 教程页面使用动态路由 `[tutorialId]`

## 数据库架构

当前使用 JSON 文件存储面试题数据（`data/questions.json`），便于开发和测试。

### API 路由
- `GET /api/questions` - 获取面试题列表（支持 category/difficulty/search 筛选）
- `POST /api/questions` - 添加新面试题
- `GET /api/questions/[id]` - 获取单个面试题
- `PUT /api/questions/[id]` - 更新面试题
- `DELETE /api/questions/[id]` - 删除面试题
- `POST /api/sync` - 触发数据同步
- `GET /api/scheduler` - 获取调度器状态
- `POST /api/scheduler` - 启动/停止调度器

### 数据同步
- **主要数据源**: [devops-exercises](https://github.com/bregman-arie/devops-exercises) (82k+ stars) - Kubernetes 面试题精选
- 支持从 GitHub 和博客抓取面试题
- 基于问题内容去重
- 定时同步（默认每6小时）

### 迁移到 PostgreSQL
如需迁移到 PostgreSQL：
1. 安装 Prisma: `npm install prisma @prisma/client`
2. 生成 Prisma Client: `npx prisma generate`
3. 更新 `src/lib/db/index.ts` 使用 PrismaClient
4. 运行迁移: `npx prisma db push`
