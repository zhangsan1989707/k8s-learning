import Link from "next/link";

const learningPaths = [
  {
    level: "beginner",
    title: "初学者",
    description: "从零开始学习 Kubernetes 基础",
    topics: ["Pod 基础", "Deployment", "Service", "Namespace"],
    color: "bg-green-500",
  },
  {
    level: "intermediate",
    title: "进阶者",
    description: "掌握 Kubernetes 进阶功能",
    topics: ["ConfigMap & Secret", "Ingress", "Horizontal Pod Autoscaler", "存储"],
    color: "bg-yellow-500",
  },
  {
    level: "advanced",
    title: "高级",
    description: "深入理解 Kubernetes 高级概念",
    topics: ["Operator & CRD", "Network Policy", "Security Context", "RBAC"],
    color: "bg-red-500",
  },
];

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">学习路径</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {learningPaths.map((path) => (
          <Link
            key={path.level}
            href={`/learn/${path.level}`}
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 ${path.color} rounded-lg mb-4`} />
            <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
            <p className="text-muted-foreground mb-4">{path.description}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {path.topics.map((topic) => (
                <li key={topic}>• {topic}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
