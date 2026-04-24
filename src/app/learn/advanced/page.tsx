import Link from "next/link";
import { advancedTutorials } from "@/lib/tutorials/curriculum";

export default function AdvancedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">高级路径</h1>
        <p className="text-muted-foreground">
          深入理解 Kubernetes 高级概念，成为 K8s 专家
        </p>
      </div>

      <div className="grid gap-6">
        {advancedTutorials.map((tutorial, index) => (
          <Link
            key={tutorial.id}
            href={`/learn/advanced/${tutorial.id}`}
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{tutorial.title}</h2>
                <p className="text-muted-foreground mb-3">{tutorial.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tutorial.estimatedTime}
                  </span>
                  <span>{tutorial.sections.length} 个章节</span>
                </div>
              </div>
              <div className="text-primary">开始学习 →</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">学完此路径后，你将掌握：</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>开发自定义 Operator 和 CRD</li>
          <li>配置网络策略实现微服务隔离</li>
          <li>使用 RBAC 进行精细化权限管理</li>
          <li>配置安全上下文和资源配额</li>
        </ul>
      </div>
    </div>
  );
}
