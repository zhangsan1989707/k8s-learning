"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import K8sTerminal from "@/components/terminal/k8s-terminal";
import YamlEditor from "@/components/editor/yaml-editor";

interface ClusterInfo {
  name: string;
  context: string;
  namespaces: string[];
  nodes: string[];
  kubectlVersion: string;
}

export default function PlaygroundPage() {
  const [kubeconfig, setKubeconfig] = useState<string>("");
  const [yaml, setYaml] = useState<string>("");
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"editor" | "yaml">("editor");
  const terminalRef = useRef<{ runCommand: (cmd: string) => void; getClusterInfo: () => ClusterInfo | null } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setKubeconfig(text);
    setConnectionError("");
  };

  const loadLocalKubeconfig = async () => {
    try {
      const response = await fetch("/api/k8s/read-local-kubeconfig");
      if (response.ok) {
        const data = await response.json();
        if (data.kubeconfig) {
          setKubeconfig(data.kubeconfig);
          setConnectionError("");
        } else {
          setConnectionError("未找到本地 kubeconfig 文件");
        }
      }
    } catch {
      setConnectionError("无法读取本地 kubeconfig");
    }
  };

  const connectToCluster = async () => {
    if (!kubeconfig.trim()) {
      setConnectionError("请先输入或上传 kubeconfig");
      return;
    }

    setIsLoading(true);
    setConnectionError("");

    try {
      // Test connection
      const response = await fetch("/api/k8s/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kubeconfig,
          command: "kubectl cluster-info && kubectl version"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "连接失败");
      }

      const result = await response.json();

      if (result.code !== 0 && result.stderr) {
        throw new Error(result.stderr);
      }

      // Get cluster info
      const [nsResult, nodesResult] = await Promise.all([
        fetch("/api/k8s/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kubeconfig, command: "kubectl get namespaces -o jsonpath='{.items[*].metadata.name}'" }),
        }),
        fetch("/api/k8s/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kubeconfig, command: "kubectl get nodes -o jsonpath='{.items[*].metadata.name}'" }),
        }),
      ]);

      const nsData = await nsResult.json();
      const nodesData = await nodesResult.json();

      const namespaces = nsData.stdout?.split(" ").filter(Boolean) || [];
      const nodes = nodesData.stdout?.split(" ").filter(Boolean) || [];

      // Extract cluster name from kubectl cluster-info
      const clusterInfoMatch = result.stdout?.match(/Kubernetes master is running at (https?:\/\/[^\s]+)/);

      setClusterInfo({
        name: clusterInfoMatch ? new URL(clusterInfoMatch[1]).hostname : "Unknown",
        context: kubeconfig.includes("current-context:") ? kubeconfig.match(/current-context:\s*(.+)/)?.[1]?.trim() || "default" : "default",
        namespaces,
        nodes,
        kubectlVersion: result.stdout.match(/Client Version:?\s*(v[\d.]+)/)?.[1] || "",
      });

      setIsConnected(true);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : "连接失败");
      setIsConnected(false);
      setClusterInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const deployYaml = async () => {
    if (!yaml.trim()) {
      setConnectionError("请先输入 YAML 配置");
      return;
    }

    setIsLoading(true);
    setConnectionError("");

    try {
      const response = await fetch("/api/k8s/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kubeconfig, yaml }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "部署失败");
      }

      if (result.stderr && result.code !== 0) {
        throw new Error(result.stderr);
      }

      // Notify terminal of successful deployment
      if (terminalRef.current) {
        terminalRef.current.runCommand(`echo "部署成功！" && kubectl get pods`);
      }
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : "部署失败");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setClusterInfo(null);
    setKubeconfig("");
    setConnectionError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kubernetes Playground</h1>

      {/* Connection Panel */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Kubeconfig</label>
            <textarea
              className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
              placeholder="粘贴你的 kubeconfig 内容，或使用下方按钮加载本地配置"
              value={kubeconfig}
              onChange={(e) => {
                setKubeconfig(e.target.value);
                setConnectionError("");
              }}
              disabled={isConnected}
            />
          </div>
          <div className="flex flex-col gap-2 lg:w-48">
            <label className="block text-sm font-medium mb-2">快速操作</label>
            <input
              type="file"
              accept=".yaml,.yml,kubeconfig"
              onChange={handleFileUpload}
              className="hidden"
              id="kubeconfig-upload"
              disabled={isConnected}
            />
            <label
              htmlFor="kubeconfig-upload"
              className={`px-4 py-2 text-sm border rounded-lg text-center cursor-pointer ${
                isConnected ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
              }`}
            >
              📁 上传文件
            </label>
            <button
              onClick={loadLocalKubeconfig}
              disabled={isConnected}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-accent disabled:opacity-50"
            >
              🏠 加载本地配置
            </button>
            {isConnected ? (
              <button
                onClick={disconnect}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                断开连接
              </button>
            ) : (
              <button
                onClick={connectToCluster}
                disabled={isLoading || !kubeconfig.trim()}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "连接中..." : "连接集群"}
              </button>
            )}
          </div>
        </div>

        {connectionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {connectionError}
          </div>
        )}

        {/* Cluster Info */}
        {clusterInfo && isConnected && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-medium text-green-800">已连接到集群</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">集群名称</span>
                <p className="font-medium">{clusterInfo.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">上下文</span>
                <p className="font-medium">{clusterInfo.context}</p>
              </div>
              <div>
                <span className="text-muted-foreground">节点数</span>
                <p className="font-medium">{clusterInfo.nodes.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">命名空间</span>
                <p className="font-medium">{clusterInfo.namespaces.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">YAML 编辑器</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "editor" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                编辑器
              </button>
              <button
                onClick={() => setActiveTab("yaml")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "yaml" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                YAML 源码
              </button>
            </div>
          </div>

          {activeTab === "editor" ? (
            <YamlEditor value={yaml} onChange={setYaml} />
          ) : (
            <textarea
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm bg-neutral-950 text-green-400"
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              placeholder="apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21"
            />
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={deployYaml}
              disabled={isLoading || !isConnected || !yaml.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "部署中..." : "🚀 部署到集群"}
            </button>
            <button
              onClick={() => setYaml("")}
              className="px-4 py-2 border rounded-lg hover:bg-accent"
            >
              清空
            </button>
          </div>
        </div>

        {/* Right: Terminal */}
        <div>
          <h2 className="text-xl font-semibold mb-4">终端</h2>
          <K8sTerminal
            ref={terminalRef}
            kubeconfig={kubeconfig}
            isConnected={isConnected}
            onConnectionChange={setIsConnected}
          />
        </div>
      </div>

      {/* Quick Commands */}
      {isConnected && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">快捷命令</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "查看 Pods", cmd: "kubectl get pods" },
              { label: "查看 Services", cmd: "kubectl get svc" },
              { label: "查看 Deployments", cmd: "kubectl get deployments" },
              { label: "查看 Namespaces", cmd: "kubectl get namespaces" },
              { label: "查看 Nodes", cmd: "kubectl get nodes" },
              { label: "查看 Events", cmd: "kubectl get events --sort-by='.lastTimestamp'" },
            ].map((item) => (
              <button
                key={item.cmd}
                onClick={() => terminalRef.current?.runCommand(item.cmd)}
                className="px-3 py-1.5 text-sm bg-muted rounded-lg hover:bg-muted/80"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
