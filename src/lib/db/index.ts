import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface Question {
  id: string;
  source: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string[];
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  syncAt: string | null;
}

const DATA_FILE = path.join(process.cwd(), "data", "questions.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readQuestions(): Question[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeQuestions(questions: Question[]): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2));
}

// Generate unique ID
function generateId(): string {
  return crypto.randomBytes(8).toString("hex");
}

// Initialize with seed data if empty
export function initializeData(): Question[] {
  const questions = readQuestions();
  if (questions.length === 0) {
    const seedData = getSeedData();
    writeQuestions(seedData);
    return seedData;
  }
  return questions;
}

function getSeedData(): Question[] {
  const now = new Date().toISOString();

  const seedQuestions: Omit<Question, "id" | "createdAt" | "updatedAt" | "syncAt">[] = [
    // 基础概念 - 初级
    {
      source: "manual",
      category: "基础概念",
      difficulty: "初级",
      question: "什么是 Kubernetes？它主要解决什么问题？",
      answer: "Kubernetes 是一个开源的容器编排平台，主要解决：\n1. 容器自动化部署和扩缩容\n2. 服务发现和负载均衡\n3. 自我修复（自动重启失败的容器）\n4. 配置管理和密钥管理\n5. 存储编排",
      tags: ["kubernetes", "基础概念"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "基础概念",
      difficulty: "初级",
      question: "Pod 和 Container 的区别是什么？",
      answer: "Pod 是 Kubernetes 的最小调度单位，一个 Pod 可以包含一个或多个容器。\n\n关键区别：\n- Container：独立的容器实例\n- Pod：包含一个或多个共享网络和存储的容器组\n- 同一 Pod 内的容器共享相同的 IP 和端口空间",
      tags: ["kubernetes", "pod", "容器"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "基础概念",
      difficulty: "初级",
      question: "什么是 Namespace？什么时候需要使用多个 Namespace？",
      answer: "Namespace 用于将集群资源划分为多个虚拟集群。\n\n使用场景：\n- 不同环境隔离（dev/staging/prod）\n- 不同团队或项目隔离\n- 资源配额管理\n- 访问权限控制",
      tags: ["kubernetes", "namespace"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "基础概念",
      difficulty: "初级",
      question: "Kubernetes 的核心组件有哪些？",
      answer: "核心组件：\n\n控制平面 (Master):\n- kube-apiserver: 集群统一入口\n- etcd: 分布式键值存储\n- kube-scheduler: Pod 调度\n- kube-controller-manager: 控制器管理\n\n工作节点 (Worker):\n- kubelet: 管理 Pod 生命周期\n- kube-proxy: 网络代理\n- container runtime: 容器运行时",
      tags: ["kubernetes", "架构", "组件"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "基础概念",
      difficulty: "初级",
      question: "kubectl 是什么？常用命令有哪些？",
      answer: "kubectl 是 Kubernetes 的命令行工具，用于与集群交互。\n\n常用命令：\n- kubectl get pods/svc/deployments: 查看资源\n- kubectl create/apply: 创建资源\n- kubectl describe: 查看资源详情\n- kubectl delete: 删除资源\n- kubectl logs/exec: 日志和执行命令\n- kubectl port-forward: 端口转发",
      tags: ["kubernetes", "kubectl", "命令行"],
      sourceUrl: null,
    },

    // 架构组件 - 中级
    {
      source: "manual",
      category: "架构组件",
      difficulty: "中级",
      question: "Kubernetes Master 节点包含哪些组件？各自的作用是什么？",
      answer: "Master 节点组件：\n\n1. kube-apiserver：集群的统一入口，提供 REST API\n2. etcd：分布式键值存储，保存集群所有数据\n3. kube-scheduler：负责 Pod 调度，选择最佳节点\n4. kube-controller-manager：运行控制器进程（Replication、Node、Endpoints 等）\n5. cloud-controller-manager：与云提供商交互（可选）",
      tags: ["kubernetes", "master", "架构"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "架构组件",
      difficulty: "中级",
      question: "详细描述一个 Pod 的创建过程",
      answer: "Pod 创建流程：\n\n1. 用户通过 kubectl 或 API 发起创建请求\n2. kube-apiserver 验证请求并写入 etcd\n3. Scheduler 监听到新的 Pod，通过算法选择最优节点\n4. kubelet 监听到分配给自己的 Pod，开始创建\n5. kubelet 调用 container runtime 拉取镜像并启动容器\n6. kubelet 更新 Pod 状态到 apiserver",
      tags: ["kubernetes", "pod", "创建流程"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "架构组件",
      difficulty: "中级",
      question: "etcd 在 Kubernetes 中的作用是什么？如何保证其高可用？",
      answer: "etcd 作用：\n- 存储 Kubernetes 集群的所有数据\n- 保存 API 对象（Pod、Service、Deployment 等）\n- 存储集群状态和配置信息\n\n高可用策略：\n- 部署 3 或 5 个节点的 etcd 集群\n- 使用 Raft 共识算法保证一致性\n- 跨可用区部署防止单点故障\n- 定期备份 etcd 数据",
      tags: ["kubernetes", "etcd", "高可用"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "架构组件",
      difficulty: "中级",
      question: "Scheduler 是如何选择最优节点的？",
      answer: "调度算法流程：\n\n1. 预选 (Filtering)：过滤不满足 Pod 需求的节点\n   - 资源需求（CPU/内存）\n   - 端口冲突\n   - 标签选择器\n   - 亲和性/反亲和性规则\n\n2. 优选 (Scoring)：对通过的节点评分\n   - 资源利用率\n   - 亲和性优先级\n   - 数据局部性\n\n3. 选择：选择评分最高的节点",
      tags: ["kubernetes", "scheduler", "调度"],
      sourceUrl: null,
    },

    // 网络 - 中级
    {
      source: "manual",
      category: "网络",
      difficulty: "中级",
      question: "Kubernetes Service 的类型有哪些？分别适用于什么场景？",
      answer: "Service 类型：\n\n1. ClusterIP（默认）：集群内部可访问的虚拟 IP\n2. NodePort：通过节点端口暴露服务（30000-32767）\n3. LoadBalancer：使用云厂商负载均衡器\n4. ExternalName：通过 DNS 名称映射服务\n5. Headless：无头服务，直接返回 Pod IP\n\n选择建议：\n- 内部服务：ClusterIP\n- 开发测试：NodePort\n- 生产环境：LoadBalancer + Ingress",
      tags: ["kubernetes", "service", "网络"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "网络",
      difficulty: "中级",
      question: "ClusterIP 和 Headless Service 的区别是什么？",
      answer: "ClusterIP Service：\n- 分配虚拟 IP（Cluster IP）\n- Kube-proxy 做负载均衡\n- DNS 解析到 Cluster IP\n\nHeadless Service：\n- 不分配 Cluster IP（clusterIP: None）\n- 直接返回 Pod IP\n- 用于有状态应用（如数据库）\n- DNS 解析直接到 Pod IP",
      tags: ["kubernetes", "service", "网络"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "网络",
      difficulty: "高级",
      question: "Ingress 和 Ingress Controller 的区别是什么？",
      answer: "Ingress：Kubernetes 资源对象，定义 HTTP/S 路由规则\n\nIngress Controller：实现这些规则的组件（如 nginx-ingress、traefik、kong）\n\n关系：\n- Ingress 是声明式配置，定义路由规则\n- Ingress Controller 是实际执行者，读取 Ingress 规则并实现\n\n常用 Ingress Controller：\n- NGINX Ingress Controller\n- Traefik\n- Kong",
      tags: ["kubernetes", "ingress", "网络"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "网络",
      difficulty: "高级",
      question: "Kube-proxy 有哪几种模式？各自的优缺点是什么？",
      answer: "Kube-proxy 三种模式：\n\n1. userspace（已废弃）\n   - 优点：兼容性好\n   - 缺点：性能差，频繁上下文切换\n\n2. iptables（默认）\n   - 优点：配置灵活，性能好\n   - 缺点：大规模下规则更新慢\n\n3. IPVS（推荐）\n   - 优点：高吞吐量，低延迟，规则同步快\n   - 缺点：需要内核模块支持",
      tags: ["kubernetes", "kube-proxy", "网络"],
      sourceUrl: null,
    },

    // 存储 - 中级
    {
      source: "manual",
      category: "存储",
      difficulty: "中级",
      question: "PersistentVolume (PV) 和 PersistentVolumeClaim (PVC) 的区别？",
      answer: "PV（PersistentVolume）：\n- 集群管理员创建的存储资源\n- 集群层面的资源\n- 定义存储类型、容量、访问模式\n\nPVC（PersistentVolumeClaim）：\n- 用户对存储的请求\n- 命名空间级别的资源\n- 声明所需存储大小和访问模式\n\n关系：PVC 绑定 PV，就像 Pod 消耗 Node 资源一样",
      tags: ["kubernetes", "存储", "pv", "pvc"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "存储",
      difficulty: "高级",
      question: "StorageClass 在 Kubernetes 存储体系中扮演什么角色？",
      answer: "StorageClass 提供动态存储供应机制：\n\n1. 管理员创建 StorageClass，定义存储类型和 provisioner\n2. 用户创建 PVC 时指定 StorageClass\n3. 系统自动创建 PV，无需手动预置\n4. 支持云厂商存储（GCE、AWS、Azure）\n\n常见 provisioner：\n- kubernetes.io/gce-pd\n- kubernetes.io/aws-ebs\n- kubernetes.io/azure-disk",
      tags: ["kubernetes", "存储", "storageclass"],
      sourceUrl: null,
    },

    // 生产实践 - 中级
    {
      source: "manual",
      category: "生产实践",
      difficulty: "中级",
      question: "如何保证 Kubernetes 集群的高可用？",
      answer: "高可用策略：\n\n1. Master 节点：至少 3 个节点，etcd 集群部署\n2. Worker 节点：跨可用区部署\n3. 应用层：使用 ReplicaSet/Deployment 保证多副本\n4. 入口层：多 Ingress Controller 实例\n5. 数据层：数据库主从跨节点部署\n\n推荐架构：\n- 3 个 Master 节点（etcd 集群）\n- 至少 2 个 Worker 节点\n- 使用负载均衡器暴露 API Server",
      tags: ["kubernetes", "高可用", "生产环境"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "生产实践",
      difficulty: "高级",
      question: "生产环境如何进行 Kubernetes 版本升级？",
      answer: "升级策略（推荐顺序）：\n\n1. 先升级 Master 节点\n2. 然后升级 Worker 节点（使用 pod-disruption-budget）\n3. 使用逐节点排空（kubectl drain）\n\n升级顺序：\netcd → kube-apiserver → controller-manager → scheduler → kubelet\n\n注意事项：\n- 建议使用托管服务（EKS/GKE）减少升级复杂性\n- 升级前务必备份 etcd\n- 小版本逐级升级",
      tags: ["kubernetes", "升级", "生产环境"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "生产实践",
      difficulty: "高级",
      question: "如何监控 Kubernetes 集群的生产环境状态？",
      answer: "监控方案：\n\n1. Metrics Server：收集资源指标（CPU、内存）\n2. Prometheus + Grafana：监控和可视化\n3. kube-state-metrics：集群对象状态\n4. Node Exporter：节点级别指标\n5. 日志：EFK（Elasticsearch/Fluentd/Kibana）或 Loki\n6. 告警：Prometheus AlertManager\n\n推荐监控体系：\n- Prometheus Operator\n- kube-prometheus-stack",
      tags: ["kubernetes", "监控", "prometheus"],
      sourceUrl: null,
    },

    // 安全 - 中级
    {
      source: "manual",
      category: "安全",
      difficulty: "中级",
      question: "RBAC 在 Kubernetes 中是如何工作的？",
      answer: "RBAC（基于角色的访问控制）：\n\n核心概念：\n1. Role/ClusterRole：定义权限规则\n2. RoleBinding/ClusterRoleBinding：绑定到用户/组/SA\n3. Subject：用户(User)、组(Group)、ServiceAccount(SA)\n\n权限动词：\nget、list、watch、create、update、delete、deletecollection、patch、bind、escalate\n\n区别：\n- Role 作用于命名空间\n- ClusterRole 作用于集群级别",
      tags: ["kubernetes", "rbac", "安全"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "安全",
      difficulty: "高级",
      question: "如何限制容器的资源使用？防止恶意占用资源？",
      answer: "资源限制方案：\n\n1. ResourceQuota：命名空间级别的资源总量限制\n2. LimitRange：单个容器默认限制\n3. Pod 级别设置 resources.limits/requests\n4. 使用 LimitRanger admission 控制器强制执行\n5. 设置 Pod 中断预算（PodDisruptionBudget）\n\n示例：\n```yaml\nresources:\n  limits:\n    cpu: \"500m\"\n    memory: \"256Mi\"\n  requests:\n    cpu: \"100m\"\n    memory: \"64Mi\"\n```",
      tags: ["kubernetes", "资源限制", "安全"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "安全",
      difficulty: "高级",
      question: "Pod Security Policy (PSP) 和 Pod Security Standards (PSS) 的区别？",
      answer: "Pod Security Policy (PSP) - 已废弃：\n- 启用需要 admission 插件\n- RBAC 控制谁能创建 PSP\n- 2021 年已从 K8s 移除\n\nPod Security Standards (PSS) - 当前推荐：\n- 内置 admission 控制器\n- 三种策略：privileged、baseline、restricted\n- 命名空间级别标签控制\n\n推荐使用 PSS + Pod Security Admission",
      tags: ["kubernetes", "安全", "psp", "pss"],
      sourceUrl: null,
    },

    // DevOps 实践 - 中级
    {
      source: "manual",
      category: "DevOps实践",
      difficulty: "中级",
      question: "如何在 Kubernetes 中部署无状态应用？",
      answer: "部署无状态应用步骤：\n\n1. 编写 Deployment YAML\n2. 配置副本数（replicas）\n3. 设置滚动更新策略\n4. 配置健康检查（liveness/readiness probe）\n5. 设置资源限制\n6. 使用 Service 暴露服务\n\n最佳实践：\n- 使用 Deployment 而非直接创建 Pod\n- 合理设置 replicas 数量\n- 配置资源 requests 和 limits\n- 使用 ConfigMap/Secret 管理配置",
      tags: ["kubernetes", "deployment", "devops"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "DevOps实践",
      difficulty: "中级",
      question: "如何实现应用的滚动更新和回滚？",
      answer: "滚动更新：\n```bash\nkubectl rollout update deployment/nginx\n```\n\n回滚：\n```bash\n# 查看历史\nkubectl rollout history deployment/nginx\n# 回滚到上一版本\nkubectl rollout undo deployment/nginx\n# 回滚到指定版本\nkubectl rollout undo deployment/nginx --to-revision=2\n```\n\nDeployment 策略配置：\n```yaml\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0\n```",
      tags: ["kubernetes", "滚动更新", "回滚", "devops"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "DevOps实践",
      difficulty: "高级",
      question: "如何实现应用的自动扩缩容？",
      answer: "HPA（Horizontal Pod Autoscaler）：\n\n```yaml\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: nginx-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: nginx\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 70\n```\n\nVPA（Vertical Pod Autoscaler）：垂直扩缩容\nKEDA：基于事件驱动的扩缩容",
      tags: ["kubernetes", "hpa", "autoscaling", "devops"],
      sourceUrl: null,
    },

    // 网络策略 - 高级
    {
      source: "manual",
      category: "网络",
      difficulty: "高级",
      question: "如何配置网络策略实现微服务隔离？",
      answer: "网络策略示例（限制后端只允许前端访问）：\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: backend-network-policy\nspec:\n  podSelector:\n    matchLabels:\n      tier: backend\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          tier: frontend\n    ports:\n    - protocol: TCP\n      port: 8080\n```\n\n默认拒绝所有入站流量：\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-ingress\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n```",
      tags: ["kubernetes", "networkpolicy", "网络安全"],
      sourceUrl: null,
    },

    // Operator - 高级
    {
      source: "manual",
      category: "高级主题",
      difficulty: "高级",
      question: "什么是 CRD（Custom Resource Definition）？如何使用？",
      answer: "CRD 是 Kubernetes 的扩展机制，允许定义新的资源类型。\n\n创建 CRD：\n```yaml\napiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata:\n  name: apps.example.com\nspec:\n  group: example.com\n  names:\n    kind: App\n    plural: apps\n  scope: Namespaced\n  versions:\n  - name: v1\n    served: true\n    storage: true\n```\n\n使用自定义资源：\n```yaml\napiVersion: example.com/v1\nkind: App\nmetadata:\n  name: my-app\nspec:\n  image: nginx\n  replicas: 3\n```",
      tags: ["kubernetes", "crd", "operator", "扩展"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "高级主题",
      difficulty: "高级",
      question: "Operator 模式是什么？它解决什么问题？",
      answer: "Operator 模式是 Kubernetes 的扩展机制，用于管理有状态应用。\n\n核心思想：\n- 将运维知识编码为软件\n- 自动化复杂应用的运维任务\n- 自定义控制器监听资源变化并采取行动\n\n解决的问题：\n- 有状态应用（如数据库）的部署和管理\n- 备份、恢复、升级等运维操作\n- 自动化故障恢复\n\n常用 Operator 框架：\n- Operator SDK\n- Kubebuilder\n- metacontroller",
      tags: ["kubernetes", "operator", "有状态应用"],
      sourceUrl: null,
    },

    // 调度 - 高级
    {
      source: "manual",
      category: "架构组件",
      difficulty: "高级",
      question: "Pod 调度失败的原因有哪些？如何排查？",
      answer: "常见调度失败原因：\n\n1. 资源不足\n   - 节点 CPU/内存不足\n   - 排查：kubectl describe node <node-name>\n\n2. 亲和性/反亲和性规则不满足\n   - 排查：kubectl describe pod <pod-name>\n\n3. 污点（Taints）不允许 Pod 调度\n   - 排查：kubectl describe node | grep Taints\n\n4. 端口冲突\n   - 检查 Service 和 Pod 使用的端口\n\n5. 存储卷挂载失败\n   - 检查 PVC 状态和存储类\n\n排查命令：\nkubectl get events --sort-by='.lastTimestamp'\nkubectl describe pod <pod-name>",
      tags: ["kubernetes", "调度", "故障排查"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "架构组件",
      difficulty: "高级",
      question: "什么是污点（Taints）和容忍（Tolerations）？",
      answer: "污点（Taints）作用于节点，拒绝 Pod 调度到该节点。\n\n添加污点：\n```bash\nkubectl taint nodes node1 key=value:NoSchedule\n```\n\n容忍（Tolerations）作用于 Pod，允许 Pod 调度到有污点的节点。\n\n```yaml\nspec:\n  tolerations:\n  - key: \"key\"\n    operator: \"Equal\"\n    value: \"value\"\n    effect: \"NoSchedule\"\n```\n\neffect 可选值：\n- NoSchedule：不会调度\n- PreferNoSchedule：尽量不调度\n- NoExecute：不会调度，且驱逐已有 Pod",
      tags: ["kubernetes", "调度", "taint", "toleration"],
      sourceUrl: null,
    },

    // 调试 - 中级
    {
      source: "manual",
      category: "运维",
      difficulty: "中级",
      question: "Pod 一直处于 Pending 状态怎么排查？",
      answer: "Pending 状态排查步骤：\n\n1. 查看 Pod 详情：\n```bash\nkubectl describe pod <pod-name>\n```\n\n2. 常见原因：\n- 资源不足（CPU/内存）\n- 调度失败（亲和性/污点）\n- PVC 未绑定\n\n3. 解决方案：\n- 增加节点资源\n- 调整调度规则\n- 检查 PVC 状态\n\n4. 查看调度日志：\n```bash\nkubectl events --for pod <pod-name>\n```",
      tags: ["kubernetes", "故障排查", "pod", "pending"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "运维",
      difficulty: "中级",
      question: "Pod 一直处于 ImagePullBackOff 状态怎么解决？",
      answer: "ImagePullBackOff 原因：\n\n1. 镜像名称错误\n2. 镜像不存在\n3. 镜像拉取认证失败\n4. 网络问题无法访问镜像仓库\n\n排查步骤：\n\n1. 查看详情：\n```bash\nkubectl describe pod <pod-name>\n```\n\n2. 检查错误信息\n\n解决方案：\n- 确认镜像名称和标签正确\n- 创建 Secret 存储镜像仓库认证\n- 配置 imagePullSecrets\n```yaml\nspec:\n  imagePullSecrets:\n  - name: my-registry-secret\n```\n- 使用可访问的镜像仓库",
      tags: ["kubernetes", "故障排查", "镜像"],
      sourceUrl: null,
    },
    {
      source: "manual",
      category: "运维",
      difficulty: "高级",
      question: "如何排查 Service 无法访问的问题？",
      answer: "Service 访问问题排查流程：\n\n1. 检查 Service 是否存在：\n```bash\nkubectl get svc\nkubectl describe svc <service-name>\n```\n\n2. 检查 Endpoints：\n```bash\nkubectl get endpoints <service-name>\n```\n\n3. 检查 Pod 是否运行：\n```bash\nkubectl get pods -l app=<label>\n```\n\n4. 检查 Selector 匹配：\n```bash\nkubectl describe svc <service-name> | grep -A5 Selector\n```\n\n5. 测试 DNS 解析：\n```bash\nkubectl run dnsutils --image=tutum/dnsutils --rm -it -- nslookup <service-name>\n```\n\n6. 从 Pod 内部测试连接：\n```bash\nkubectl exec -it <pod-name> -- curl <service-name>:<port>\n```",
      tags: ["kubernetes", "故障排查", "service", "网络"],
      sourceUrl: null,
    },
  ];

  return seedQuestions.map((q, index) => ({
    ...q,
    id: (index + 1).toString(),
    createdAt: now,
    updatedAt: now,
    syncAt: null,
  }));
}

export const db = {
  questions: {
    findMany: async (filter?: {
      where?: {
        category?: string;
        difficulty?: string;
        OR?: Array<{ question?: { contains: string } }>;
      };
      orderBy?: { createdAt?: "desc" };
    }): Promise<Question[]> => {
      let questions = readQuestions();

      if (filter?.where?.category) {
        questions = questions.filter((q) => q.category === filter.where!.category);
      }
      if (filter?.where?.difficulty) {
        questions = questions.filter((q) => q.difficulty === filter.where!.difficulty);
      }
      if (filter?.where?.OR) {
        const searchTerms = filter.where.OR.map(
          (or) => or.question?.contains?.toLowerCase()
        ).filter(Boolean);
        if (searchTerms.length > 0) {
          questions = questions.filter((q) =>
            searchTerms.some(
              (term) =>
                term &&
                (q.question.toLowerCase().includes(term) ||
                  q.answer.toLowerCase().includes(term))
            )
          );
        }
      }

      return questions;
    },

    findUnique: async (where: { id: string }): Promise<Question | null> => {
      const questions = readQuestions();
      return questions.find((q) => q.id === where.id) || null;
    },

    create: async (data: Omit<Question, "id" | "createdAt" | "updatedAt">): Promise<Question> => {
      const questions = readQuestions();
      const now = new Date().toISOString();
      const newQuestion: Question = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      questions.push(newQuestion);
      writeQuestions(questions);
      return newQuestion;
    },

    update: async (
      where: { id: string },
      data: Partial<Question>
    ): Promise<Question> => {
      const questions = readQuestions();
      const index = questions.findIndex((q) => q.id === where.id);
      if (index === -1) throw new Error("Question not found");

      questions[index] = {
        ...questions[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeQuestions(questions);
      return questions[index];
    },

    delete: async (where: { id: string }): Promise<void> => {
      const questions = readQuestions();
      const filtered = questions.filter((q) => q.id !== where.id);
      writeQuestions(filtered);
    },

    findFirst: async (where: {
      OR?: Array<{ question?: string; sourceUrl?: string }>;
    }): Promise<Question | null> => {
      const questions = readQuestions();
      return (
        questions.find((q) => {
          if (!where.OR) return false;
          return where.OR.some(
            (or) =>
              (or.question && q.question === or.question) ||
              (or.sourceUrl && q.sourceUrl === or.sourceUrl)
          );
        }) || null
      );
    },
  },
};

export default db;
