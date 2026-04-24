# K8s Learning

交互式 Kubernetes 学习平台，通过动手实验和真实集群连接来掌握 K8s 技能。

## 功能特性

### 学习路径
- **初学者路径**: K8s概述、Pod基础、Deployment基础、Service基础、Namespace基础
- **进阶路径**: ConfigMap/Secret、Ingress、HPA、PV/PVC
- **高级路径**: Operator开发、网络策略、RBAC、安全上下文、资源配额

### 面试题库
- 涵盖基础概念、架构组件、网络、存储、生产实践、安全等分类
- 支持按分类和难度筛选
- 内置 30+ 道精选面试题
- 支持从公开数据源同步更多题目

### Playground
- **Kubeconfig 管理**: 支持粘贴、上传文件、检测本地 `~/.kube/config`
- **真实集群连接**: 连接本地 minikube/kind 集群
- **交互式终端**: 命令历史（上下箭头）、Ctrl+C 中断
- **YAML 编辑器**: Monaco Editor 可视化编辑
- **一键部署**: 将 YAML 配置部署到连接集群

### 生产案例
- 8个生产级配置案例：Nginx部署、MySQL有状态部署、Ingress HTTPS、HPA自动扩缩容、ConfigMap/Secret配置、网络策略、Pod中断预算、定时任务

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: Tailwind CSS
- **终端**: xterm.js
- **代码编辑器**: Monaco Editor
- **容器**: Docker + Docker Compose

## 快速开始

### 环境要求

- Node.js 18+
- Docker 和 Docker Compose
- kubectl (用于 Playground 连接集群)

### 安装

```bash
# 克隆仓库
git clone <your-repo-url>
cd k8s-learning

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 访问 http://localhost:3000
```

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── k8s/              # K8s 相关 API
│   │   ├── questions/         # 面试题 CRUD API
│   │   └── sync/             # 数据同步 API
│   ├── cases/                # 生产案例页面
│   ├── interview/            # 面试题页面
│   ├── learn/               # 学习路径
│   │   ├── beginner/         # 初学者路径
│   │   ├── intermediate/     # 进阶路径
│   │   └── advanced/         # 高级路径
│   └── playground/            # Playground 页面
├── components/
│   ├── editor/               # YAML 编辑器
│   └── terminal/             # K8s 终端
└── lib/
    ├── db/                    # 数据存储
    ├── scrapers/              # 数据爬虫
    └── tutorials/             # 教程内容
```

## API 路由

| 路由 | 说明 |
|------|------|
| `GET /api/questions` | 获取面试题列表 |
| `POST /api/questions` | 添加面试题 |
| `POST /api/sync` | 同步外部数据 |
| `POST /api/k8s/exec` | 执行 kubectl 命令 |
| `POST /api/k8s/deploy` | 部署 YAML |

## 开发

```bash
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run lint     # 代码检查
```

## 数据来源

面试题数据主要来自 [devops-exercises](https://github.com/bregman-arie/devops-exercises) 项目。

## License

MIT
