"use client";

import { useState } from "react";
import Link from "next/link";

interface Case {
  id: string;
  title: string;
  description: string;
  difficulty: "基础" | "进阶" | "高级";
  category: string;
  steps: string[];
  yaml?: string;
}

const cases: Case[] = [
  {
    id: "production-nginx",
    title: "生产级 Nginx 部署",
    description: "使用完整的生产配置部署 Nginx，包括健康检查、资源限制、高可用",
    difficulty: "基础",
    category: "Web服务",
    steps: [
      "创建生产级 Deployment 配置",
      "设置 resource limits 和 requests",
      "配置健康检查（livenessProbe/readinessProbe）",
      "创建 ClusterIP Service",
      "验证 Pod 运行状态",
    ],
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
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
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "64Mi"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5`,
  },
  {
    id: "production-mysql",
    title: "有状态 MySQL 部署",
    description: "部署生产级 MySQL，使用 PVC 实现数据持久化",
    difficulty: "进阶",
    category: "数据库",
    steps: [
      "创建 PVC 持久化存储",
      "配置 MySQL Deployment",
      "设置环境变量配置",
      "挂载数据目录",
      "验证数据持久化",
    ],
    yaml: `apiVersion: v1
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
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "changeme"
        - name: MYSQL_DATABASE
          value: "app"
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc`,
  },
  {
    id: "ingress-https",
    title: "Ingress HTTPS 配置",
    description: "配置生产级 Ingress，支持 HTTPS、域名路由和 SSL 终止",
    difficulty: "进阶",
    category: "网络",
    steps: [
      "创建 TLS Secret 存储证书",
      "配置 Ingress 规则",
      "启用 HTTPS",
      "配置路径重写",
      "测试访问",
    ],
    yaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: production-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
  - hosts:
      - app.example.com
    secretName: tls-secret
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
              number: 80`,
  },
  {
    id: "hpa-scaling",
    title: "HPA 自动扩缩容",
    description: "配置 HorizontalPodAutoscaler，实现基于 CPU/内存的自动扩缩容",
    difficulty: "进阶",
    category: "运维",
    steps: [
      "确保 Deployment 已设置 resource limits",
      "安装 metrics-server",
      "创建 HPA 资源",
      "生成负载测试",
      "观察扩缩容行为",
    ],
    yaml: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-production
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0`,
  },
  {
    id: "configmap-secret",
    title: "配置管理与密钥",
    description: "使用 ConfigMap 和 Secret 管理配置，实现配置与代码分离",
    difficulty: "基础",
    category: "配置管理",
    steps: [
      "创建 ConfigMap 存储配置",
      "创建 Secret 存储敏感信息",
      "在 Pod 中引用 ConfigMap",
      "以环境变量方式使用 Secret",
      "验证配置生效",
    ],
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "mysql.default.svc.cluster.local"
  DATABASE_PORT: "3306"
  LOG_LEVEL: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  DATABASE_USER: "appuser"
  DATABASE_PASSWORD: "changeme123"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: app:v1
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secret`,
  },
  {
    id: "pdb-high-availability",
    title: "Pod 中断预算",
    description: "配置 PodDisruptionBudget 保证升级和维护时的可用性",
    difficulty: "高级",
    category: "运维",
    steps: [
      "创建高可用应用（3副本以上）",
      "定义 PDB 允许最小可用数",
      "执行节点维护（kubectl drain）",
      "观察 Pod 被驱逐过程",
      "验证服务持续可用",
    ],
    yaml: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: nginx-production
---
# 或者使用百分比
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb-percent
spec:
  maxUnavailable: 25%
  selector:
    matchLabels:
      app: nginx-production`,
  },
  {
    id: "network-policy",
    title: "网络策略",
    description: "配置 NetworkPolicy 实现微服务之间的网络隔离",
    difficulty: "高级",
    category: "安全",
    steps: [
      "创建前端 Pod",
      "创建后端 Pod",
      "创建数据库 Pod",
      "配置默认拒绝策略",
      "配置允许访问规则",
    ],
    yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: database
    ports:
    - protocol: TCP
      port: 3306`,
  },
  {
    id: "job-cronjob",
    title: "定时任务与Job",
    description: "使用 Job 和 CronJob 执行定时任务和批处理作业",
    difficulty: "基础",
    category: "任务调度",
    steps: [
      "创建一次性 Job",
      "创建定时 CronJob",
      "配置并发策略",
      "设置历史记录保留",
      "查看任务执行日志",
    ],
    yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mysql:8.0
            command:
            - /bin/sh
            - -c
            - |
              mysqldump -h mysql -u root -p$MYSQL_ROOT_PASSWORD app > /backup/app-$(date +%Y%m%d).sql
            env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: DATABASE_PASSWORD
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: backup-pvc`,
  },
];

const categories = [...new Set(cases.map((c) => c.category))];

export default function CasesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const filteredCases = cases.filter(
    (c) => selectedCategory === "全部" || c.category === selectedCategory
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">生产环境案例</h1>
      <p className="text-muted-foreground mb-6">
        真实的生产环境配置案例，每个案例都包含完整的 YAML 和操作步骤
      </p>

      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="全部">全部分类</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="border rounded-lg overflow-hidden flex flex-col"
          >
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    c.difficulty === "基础"
                      ? "bg-green-100 text-green-700"
                      : c.difficulty === "进阶"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{c.category}</span>
              </div>
              <h3 className="font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </div>
            <div className="border-t p-4 bg-muted/30">
              <button
                onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                className="text-sm text-primary hover:underline"
              >
                {expandedCase === c.id ? "收起详情" : "查看详情"}
              </button>
            </div>
            {expandedCase === c.id && (
              <div className="border-t p-4 bg-muted/50">
                <h4 className="font-medium mb-2">操作步骤：</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                  {c.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {c.yaml && (
                  <>
                    <h4 className="font-medium mb-2">完整 YAML：</h4>
                    <pre className="text-xs bg-neutral-900 text-green-400 p-3 rounded overflow-x-auto">
                      {c.yaml}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
