import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          交互式 Kubernetes 学习平台
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          通过动手实验和实时反馈，掌握 Kubernetes 技能
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/playground"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            开始实验
          </Link>
          <Link
            href="/learn"
            className="px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
          >
            学习路径
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">初学者</h3>
          <p className="text-muted-foreground mb-4">
            从零开始，学习 Pod、Deployment、Service 等核心概念
          </p>
          <Link href="/learn/beginner" className="text-primary hover:underline">
            开始学习 →
          </Link>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">进阶者</h3>
          <p className="text-muted-foreground mb-4">
            深入学习 ConfigMap、Secret、Ingress、HPA 等进阶内容
          </p>
          <Link href="/learn/intermediate" className="text-primary hover:underline">
            开始学习 →
          </Link>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">高级</h3>
          <p className="text-muted-foreground mb-4">
            探索 Operator、CRD、Security、网络策略等高级主题
          </p>
          <Link href="/learn/advanced" className="text-primary hover:underline">
            开始学习 →
          </Link>
        </div>
      </section>
    </div>
  );
}
