export interface Tutorial {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  level: "beginner" | "intermediate" | "advanced";
  order: number;
  sections: TutorialSection[];
}

export interface TutorialSection {
  title: string;
  content: string;
  type: "text" | "code" | "exercise";
  code?: string;
  hint?: string;
  expectedResult?: string;
}

export const beginnerTutorials: Tutorial[] = [
  {
    id: "k8s-overview",
    title: "Kubernetes 概述",
    description: "了解 Kubernetes 的基本概念和架构",
    estimatedTime: "15分钟",
    level: "beginner",
    order: 1,
    sections: [
      {
        title: "什么是 Kubernetes",
        content: `Kubernetes（简称 K8s）是一个开源的容器编排平台，最初由 Google 开发，现由云原生计算基金会（CNCF）维护。

**核心能力：**
- 自动化部署和扩缩容容器应用
- 服务发现和负载均衡
- 自我修复（自动重启失败的容器）
- 配置管理和密钥管理
- 存储编排

**为什么学习 Kubernetes：**
1. 云原生时代的标准部署平台
2. 主流云厂商（AWS EKS、GKE、Azure AKS）都支持
3. 提升 DevOps 技能和职场竞争力`,
        type: "text",
      },
      {
        title: "Kubernetes 集群架构",
        content: `一个 Kubernetes 集群由 Master 节点和 Worker 节点组成：

**Master 节点（控制平面）：**
- kube-apiserver：集群统一入口
- etcd：分布式数据库，存储集群状态
- kube-scheduler：负责 Pod 调度
- kube-controller-manager：运行各种控制器

**Worker 节点：**
- kubelet：管理 Pod 的生命周期
- kube-proxy：网络代理，维护网络规则
- container runtime：容器运行时（Docker/containerd）`,
        type: "text",
      },
    ],
  },
  {
    id: "pod-basics",
    title: "Pod 基础",
    description: "学习 Pod 的概念、创建和管理",
    estimatedTime: "30分钟",
    level: "beginner",
    order: 2,
    sections: [
      {
        title: "Pod 概念",
        content: `Pod 是 Kubernetes 中的最小调度单位，每个 Pod 包含一个或多个容器。

**Pod 的特点：**
- 共享网络命名空间（同一 Pod 内容器可通过 localhost 通信）
- 共享存储卷
- 共享进程命名空间（可选）
- 拥有唯一的集群 IP 地址`,
        type: "text",
      },
      {
        title: "创建第一个 Pod",
        content: `使用 kubectl 创建第一个 Pod：

\`\`\`bash
kubectl run nginx --image=nginx:1.21 --port=80
\`\`\`

查看 Pod 状态：
\`\`\`bash
kubectl get pods
kubectl describe pod nginx
\`\`\`

删除 Pod：
\`\`\`bash
kubectl delete pod nginx
\`\`\``,
        type: "code",
      },
      {
        title: "动手练习：创建 Pod",
        content: "使用 YAML 文件创建一个 nginx Pod，暴露端口 80",
        type: "exercise",
        code: `# 创建 nginx Pod
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80`,
        hint: "使用 kubectl apply -f <文件名> 创建资源",
        expectedResult: "Pod 状态为 Running",
      },
    ],
  },
  {
    id: "deployment-basics",
    title: "Deployment 基础",
    description: "使用 Deployment 管理应用的部署和扩缩容",
    estimatedTime: "30分钟",
    level: "beginner",
    order: 3,
    sections: [
      {
        title: "为什么需要 Deployment",
        content: `Pod 是临时性的，当节点故障时 Pod 会丢失。Deployment 提供了：

1. **副本管理**：保持指定数量的 Pod 副本运行
2. **滚动更新**：平滑地更新应用版本
3. **回滚**：出现问题时恢复到之前的版本
4. **扩缩容**：轻松调整副本数量`,
        type: "text",
      },
      {
        title: "创建 Deployment",
        content: `\`\`\`bash
kubectl create deployment nginx --image=nginx:1.21 --replicas=3
\`\`\`

查看 Deployment：
\`\`\`bash
kubectl get deployments
kubectl get pods
\`\`\`

扩缩容：
\`\`\`bash
kubectl scale deployment nginx --replicas=5
\`\`\`

更新镜像：
\`\`\`bash
kubectl set image deployment/nginx nginx=nginx:1.22
\`\`\``,
        type: "code",
      },
      {
        title: "动手练习：管理 Deployment",
        content: "创建一个 3 副本的 nginx Deployment，然后扩缩容到 5 副本",
        type: "exercise",
        code: `# nginx Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80`,
        hint: "先创建 Deployment，然后用 kubectl scale 命令扩缩容",
        expectedResult: "5 个 Pod 都在 Running 状态",
      },
    ],
  },
  {
    id: "service-basics",
    title: "Service 基础",
    description: "通过 Service 实现服务发现和负载均衡",
    estimatedTime: "25分钟",
    level: "beginner",
    order: 4,
    sections: [
      {
        title: "为什么需要 Service",
        content: `Pod 的 IP 是动态分配的，当 Pod 故障被重新调度时，IP 会变化。Service 提供了：

1. **稳定的 IP 地址**：Service IP 不会变化
2. **负载均衡**：自动将请求分发到多个 Pod
3. **服务发现**：通过服务名访问其他应用`,
        type: "text",
      },
      {
        title: "Service 类型",
        content: `**ClusterIP（默认）：** 集群内部可访问的虚拟 IP
\`\`\`yaml
spec:
  type: ClusterIP
\`\`\`

**NodePort：** 通过节点端口暴露服务
\`\`\`yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
\`\`\`

**LoadBalancer：** 使用云厂商负载均衡器`,
        type: "code",
      },
      {
        title: "动手练习：创建 Service",
        content: "为 nginx Deployment 创建一个 ClusterIP Service",
        type: "exercise",
        code: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP`,
        hint: "确保 Deployment 的 pod labels 和 Service 的 selector 匹配",
        expectedResult: "Service 创建成功，可以从集群内访问",
      },
    ],
  },
  {
    id: "namespace-basics",
    title: "Namespace 基础",
    description: "使用 Namespace 组织和管理集群资源",
    estimatedTime: "20分钟",
    level: "beginner",
    order: 5,
    sections: [
      {
        title: "Namespace 概念",
        content: `Namespace（命名空间）是 Kubernetes 用于隔离资源的虚拟集群。

**使用场景：**
- 环境隔离：dev、staging、production
- 项目隔离：不同团队或产品线
- 资源配额：限制每个命名空间的资源使用
- 访问控制：不同命名空间设置不同的权限`,
        type: "text",
      },
      {
        title: "操作 Namespace",
        content: `查看命名空间：
\`\`\`bash
kubectl get namespaces
kubectl get pods -n kube-system  # 查看特定命名空间
\`\`\`

创建命名空间：
\`\`\`bash
kubectl create namespace dev
\`\`\`

在指定命名空间创建资源：
\`\`\`bash
kubectl create deployment nginx -n dev --image=nginx
\`\`\``,
        type: "code",
      },
    ],
  },
];

export const intermediateTutorials: Tutorial[] = [
  {
    id: "configmap-secret",
    title: "ConfigMap 和 Secret",
    description: "管理应用配置和敏感信息",
    estimatedTime: "35分钟",
    level: "intermediate",
    order: 1,
    sections: [
      {
        title: "ConfigMap",
        content: `ConfigMap 用于存储非敏感的配置文件和环境变量。

**创建方式：**
\`\`\`bash
# 从文件创建
kubectl create configmap app-config --from-file=config.properties

# 从字面值创建
kubectl create configmap app-config \\
  --from-literal=ENV=production \\
  --from-literal=LOG_LEVEL=info
\`\`\``,
        type: "code",
      },
      {
        title: "Secret",
        content: `Secret 用于存储敏感信息，如密码、密钥、证书。

**类型：**
- Opaque：通用密钥
- TLS：TLS 证书
- Docker registry：镜像仓库认证

\`\`\`bash
# 创建 generic Secret
kubectl create secret generic db-credentials \\
  --from-literal=username=admin \\
  --from-literal=password=changeme
\`\`\``,
        type: "code",
      },
      {
        title: "动手练习：使用 ConfigMap 和 Secret",
        content: "创建 ConfigMap 和 Secret，并在 Pod 中引用它们",
        type: "exercise",
        code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "mysql"
  LOG_LEVEL: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  DB_PASSWORD: "secret123"`,
        hint: "使用 envFrom 或 env 在 Pod 中引用 ConfigMap 和 Secret",
        expectedResult: "Pod 启动后可以读取到配置和密钥",
      },
    ],
  },
  {
    id: "ingress",
    title: "Ingress 配置",
    description: "使用 Ingress 管理 HTTP/S 路由",
    estimatedTime: "40分钟",
    level: "intermediate",
    order: 2,
    sections: [
      {
        title: "Ingress 概念",
        content: `Ingress 提供了 HTTP/S 路由功能，是集群外部访问内部服务的入口。

**功能：**
- 基于域名的路由
- 基于路径的路由
- SSL/TLS 终止
- 负载均衡`,
        type: "text",
      },
      {
        title: "安装 Ingress Controller",
        content: `常用的 Ingress Controller：
- NGINX Ingress Controller
- Traefik
- Kong

\`\`\`bash
# 安装 NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
\`\`\``,
        type: "code",
      },
      {
        title: "配置 Ingress",
        content: `\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "hpa",
    title: "Horizontal Pod Autoscaler",
    description: "实现基于指标的自动扩缩容",
    estimatedTime: "35分钟",
    level: "intermediate",
    order: 3,
    sections: [
      {
        title: "HPA 概念",
        content: `Horizontal Pod Autoscaler (HPA) 根据资源指标自动调整 Pod 副本数。

**支持的指标：**
- CPU 利用率
- 内存利用率
- 自定义指标（需要 Prometheus Adapter）`,
        type: "text",
      },
      {
        title: "配置 HPA",
        content: `前提条件：Pod 必须设置 resource limits 和 requests

\`\`\`bash
# 创建 HPA
kubectl autoscale deployment nginx \\
  --cpu-percent=70 \\
  --min=2 \\
  --max=10
\`\`\`

或使用 YAML：
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "pv-pvc",
    title: "持久化存储 PV/PVC",
    description: "管理有状态应用的持久化存储",
    estimatedTime: "40分钟",
    level: "intermediate",
    order: 4,
    sections: [
      {
        title: "存储架构",
        content: `**PersistentVolume (PV)：** 集群级别的存储资源，由管理员创建

**PersistentVolumeClaim (PVC)：** 用户对存储的请求，命名空间级别

**StorageClass：** 动态存储供应，按需创建 PV`,
        type: "text",
      },
      {
        title: "使用 PVC",
        content: `\`\`\`yaml
# 创建 PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
# Pod 使用 PVC
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    volumeMounts:
    - name: mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: mysql-storage
    persistentVolumeClaim:
      claimName: mysql-pvc
\`\`\``,
        type: "code",
      },
    ],
  },
];

export const advancedTutorials: Tutorial[] = [
  {
    id: "operator",
    title: "Operator 开发入门",
    description: "使用 Operator SDK 构建自定义控制器",
    estimatedTime: "60分钟",
    level: "advanced",
    order: 1,
    sections: [
      {
        title: "Operator 概念",
        content: `Operator 是 Kubernetes 的扩展机制，用于管理有状态应用。

**核心思想：**
将运维知识编码为 CRD（Custom Resource Definition）和控制器

**常用 Operator 框架：**
- Operator SDK
- Kubebuilder
- metacontroller`,
        type: "text",
      },
      {
        title: "创建 CRD",
        content: `\`\`\`yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: apps.example.com
spec:
  group: example.com
  names:
    kind: App
    plural: apps
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "network-policy",
    title: "网络策略",
    description: "配置微服务之间的网络隔离",
    estimatedTime: "40分钟",
    level: "advanced",
    order: 2,
    sections: [
      {
        title: "网络策略概念",
        content: `网络策略（NetworkPolicy）定义了 Pod 之间的网络访问规则。

**默认行为：**
- Kubernetes 默认允许所有流量
- 需要明确配置网络策略来限制访问

**规则类型：**
- podSelector：基于标签选择目标 Pod
- namespaceSelector：基于命名空间选择
- IP Block：基于 IP 段`,
        type: "text",
      },
      {
        title: "配置网络策略",
        content: `\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "rbac",
    title: "RBAC 权限管理",
    description: "配置基于角色的访问控制",
    estimatedTime: "45分钟",
    level: "advanced",
    order: 3,
    sections: [
      {
        title: "RBAC 概念",
        content: `RBAC（Role-Based Access Control）用于控制用户和服务账号对集群资源的访问权限。

**核心概念：**
- Role/ClusterRole：定义权限
- RoleBinding/ClusterRoleBinding：绑定权限到主体
- Subject：用户、组或 ServiceAccount`,
        type: "text",
      },
      {
        title: "配置 RBAC",
        content: `\`\`\`yaml
# 创建 Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
# 创建 RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
subjects:
- kind: User
  name: developer
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "security-context",
    title: "安全上下文",
    description: "配置 Pod 和容器的安全设置",
    estimatedTime: "40分钟",
    level: "advanced",
    order: 4,
    sections: [
      {
        title: "安全上下文",
        content: `安全上下文（Security Context）定义了 Pod/容器的特权和访问控制设置。

**主要配置：**
- 运行用户/组
- 权限提升
- Linux 能力
- Seccomp 配置
- AppArmor/SELinux`,
        type: "text",
      },
      {
        title: "配置安全上下文",
        content: `\`\`\`yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    image: app:v1
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
\`\`\``,
        type: "code",
      },
    ],
  },
  {
    id: "resource-quota",
    title: "资源配额与限制",
    description: "管理命名空间级别的资源使用",
    estimatedTime: "35分钟",
    level: "advanced",
    order: 5,
    sections: [
      {
        title: "ResourceQuota",
        content: `ResourceQuota 限制了命名空间中的资源总量。

**配额类型：**
- 计算资源：cpu, memory
- 存储资源：storage
- 对象数量：pods, services, configmaps`,
        type: "text",
      },
      {
        title: "配置资源配额",
        content: `\`\`\`yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: prod-quota
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "100"
    services: "20"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
spec:
  limits:
  - type: Container
    default:
      cpu: "500m"
      memory: "256Mi"
    defaultRequest:
      cpu: "100m"
      memory: "64Mi"
\`\`\``,
        type: "code",
      },
    ],
  },
];

export const allTutorials = {
  beginner: beginnerTutorials,
  intermediate: intermediateTutorials,
  advanced: advancedTutorials,
};
