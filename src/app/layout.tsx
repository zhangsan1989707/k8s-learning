import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "K8s Learning - 交互式 Kubernetes 学习平台",
  description: "通过交互式教程和动手实验学习 Kubernetes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              K8s Learning
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/learn" className="hover:text-primary">
                学习路径
              </Link>
              <Link href="/interview" className="hover:text-primary">
                面试题
              </Link>
              <Link href="/cases" className="hover:text-primary">
                生产案例
              </Link>
              <Link href="/playground" className="hover:text-primary">
                Playground
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            K8s Learning - 交互式 Kubernetes 学习平台
          </div>
        </footer>
      </body>
    </html>
  );
}
