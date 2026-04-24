"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon } from "@xterm/addon-search";
import "@xterm/xterm/css/xterm.css";

export interface K8sTerminalHandle {
  runCommand: (cmd: string) => void;
}

interface K8sTerminalProps {
  kubeconfig: string;
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const K8sTerminal = forwardRef<K8sTerminalHandle, K8sTerminalProps>(
  ({ kubeconfig, isConnected, onConnectionChange }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const inputBuffer = useRef<string>("");
    const commandHistory = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);

    useImperativeHandle(ref, () => ({
      runCommand: (cmd: string) => {
        if (terminalInstance.current && isConnected) {
          executeCommand(cmd);
        }
      },
    }));

    const executeCommand = async (cmd: string) => {
      if (!cmd.trim() || !terminalInstance.current) return;

      const term = terminalInstance.current;
      const trimmedCmd = cmd.trim();

      // Add to history
      commandHistory.current.push(trimmedCmd);
      historyIndex.current = commandHistory.current.length;

      // Display command
      term.writeln(`\x1b[36m$ {trimmedCmd}\x1b[0m`);

      // Clear input buffer
      inputBuffer.current = "";

      if (trimmedCmd === "clear" || trimmedCmd === "cls") {
        term.clear();
        return;
      }

      try {
        const response = await fetch("/api/k8s/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kubeconfig, command: trimmedCmd }),
        });

        const result = await response.json();

        if (result.stdout) {
          term.writeln(result.stdout);
        }
        if (result.stderr) {
          term.writeln(`\x1b[31m${result.stderr}\x1b[0m`);
        }
      } catch (err) {
        term.writeln(`\x1b[31mError: ${err}\x1b[0m`);
      }

      term.writeln("");
      prompt(term);
    };

    const prompt = (term: Terminal) => {
      term.write("\r\n\x1b[32mλ\x1b[0m ");
    };

    useEffect(() => {
      if (!terminalRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        theme: {
          background: "#0d1117",
          foreground: "#c9d1d9",
          cursor: "#c9d1d9",
        },
        scrollback: 10000,
      });

      const fit = new FitAddon();
      const search = new SearchAddon();

      fitAddon.current = fit;
      term.loadAddon(fit);
      term.loadAddon(search);

      term.open(terminalRef.current);
      fit.fit();

      terminalInstance.current = term;

      term.writeln("\x1b[1;32m╔════════════════════════════════════════╗\x1b[0m");
      term.writeln("\x1b[1;32m║\x1b[0m  Kubernetes Playground Terminal     \x1b[1;32m║\x1b[0m");
      term.writeln("\x1b[1;32m╚════════════════════════════════════════╝\x1b[0m");
      term.writeln("");
      term.writeln("\x1b[33m状态: 等待连接...\x1b[0m");
      term.writeln('\x1b[90m请在左侧输入 kubeconfig 并点击"连接集群"\x1b[0m');
      term.writeln("");

      const handleResize = () => {
        fit.fit();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        term.dispose();
      };
    }, []);

    useEffect(() => {
      if (!terminalInstance.current) return;

      const term = terminalInstance.current;

      if (isConnected) {
        term.clear();
        term.writeln("\x1b[1;32m✓ 已连接到集群\x1b[0m");
        term.writeln("");
        term.writeln("\x1b[36m可用命令示例：\x1b[0m");
        term.writeln("  kubectl get pods          - 查看 Pods");
        term.writeln("  kubectl get svc           - 查看 Services");
        term.writeln("  kubectl get nodes         - 查看 Nodes");
        term.writeln("  kubectl apply -f -        - 从 stdin 部署");
        term.writeln("  clear                    - 清屏");
        term.writeln("");
        prompt(term);

        // Add key listener
        term.onKey((e) => {
          const char = e.key;

          if (char === "\r") {
            // Enter
            if (inputBuffer.current.trim()) {
              executeCommand(inputBuffer.current);
            } else {
              prompt(term);
            }
          } else if (char === "") {
            // Backspace
            if (inputBuffer.current.length > 0) {
              inputBuffer.current = inputBuffer.current.slice(0, -1);
              term.write("\b \b");
            }
          } else if (char === "[A") {
            // Up arrow - history previous
            if (historyIndex.current > 0) {
              historyIndex.current--;
              const cmd = commandHistory.current[historyIndex.current];
              // Clear current line
              term.write("\r\x1b[32mλ\x1b[0m " + " ".repeat(inputBuffer.current.length));
              term.write("\r\x1b[32mλ\x1b[0m ");
              term.write(cmd);
              inputBuffer.current = cmd;
            }
          } else if (char === "[B") {
            // Down arrow - history next
            if (historyIndex.current < commandHistory.current.length - 1) {
              historyIndex.current++;
              const cmd = commandHistory.current[historyIndex.current];
              term.write("\r\x1b[32mλ\x1b[0m " + " ".repeat(inputBuffer.current.length));
              term.write("\r\x1b[32mλ\x1b[0m ");
              term.write(cmd);
              inputBuffer.current = cmd;
            }
          } else if (char === "") {
            // Ctrl+C
            term.writeln("^C");
            inputBuffer.current = "";
            prompt(term);
          } else {
            inputBuffer.current += char;
            term.write(char);
          }
        });

        // Handle paste
        term.onData((data) => {
          if (data.length > 1 && !data.startsWith("\x1b")) {
            inputBuffer.current += data;
            term.write(data);
          }
        });
      } else {
        term.clear();
        term.writeln("\x1b[31m✗ 已断开连接\x1b[0m");
        term.writeln("");
        term.writeln("\x1b[33m状态: 等待连接...\x1b[0m");
        term.writeln('\x1b[90m请在左侧输入 kubeconfig 并点击"连接集群"\x1b[0m');
        term.writeln("");
      }
    }, [isConnected]);

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-neutral-900 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-white ml-2">bash</span>
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <span className="text-xs text-green-400">● Connected</span>
            )}
          </div>
        </div>
        <div ref={terminalRef} className="h-[500px] bg-[#0d1117] p-2" />
      </div>
    );
  }
);

K8sTerminal.displayName = "K8sTerminal";

export default K8sTerminal;
