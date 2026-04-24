"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultYaml = `# 示例: 创建一个 Nginx Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
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
        - containerPort: 80
`;

export default function YamlEditor({ value, onChange }: YamlEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-neutral-900 p-2 text-sm text-white">YAML 编辑器</div>
      <MonacoEditor
        height="384px"
        defaultLanguage="yaml"
        value={value || defaultYaml}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
