import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { kubeconfig, command } = await request.json();

    if (!kubeconfig || !command) {
      return NextResponse.json(
        { error: "kubeconfig and command are required" },
        { status: 400 }
      );
    }

    const tempKubeconfig = `/tmp/k8s-learning-${Date.now()}.yaml`;
    fs.writeFileSync(tempKubeconfig, kubeconfig);

    return new Promise<Response>((resolve) => {
      // Use bash -c with explicit path to ensure proper command handling
      const kubectl = spawn("bash", ["-lc", `KUBECONFIG=${tempKubeconfig} ${command}`]);

      let stdout = "";
      let stderr = "";

      kubectl.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      kubectl.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      kubectl.on("close", (code) => {
        try {
          fs.unlinkSync(tempKubeconfig);
        } catch {
          // Ignore cleanup errors
        }
        resolve(
          NextResponse.json({
            stdout,
            stderr,
            code: code || 0,
          })
        );
      });

      kubectl.on("error", (err) => {
        try {
          fs.unlinkSync(tempKubeconfig);
        } catch {
          // Ignore cleanup errors
        }
        resolve(
          NextResponse.json({
            error: err.message,
            code: 1,
          })
        );
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
