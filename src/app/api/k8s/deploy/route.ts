import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { kubeconfig, yaml } = await request.json();

    if (!kubeconfig || !yaml) {
      return NextResponse.json(
        { error: "kubeconfig and yaml are required" },
        { status: 400 }
      );
    }

    const tempKubeconfig = `/tmp/k8s-learning-${Date.now()}.yaml`;
    fs.writeFileSync(tempKubeconfig, kubeconfig);

    const tempYaml = `/tmp/k8s-learning-deploy-${Date.now()}.yaml`;
    fs.writeFileSync(tempYaml, yaml);

    return new Promise<Response>((resolve) => {
      const kubectl = spawn("bash", ["-lc", `KUBECONFIG=${tempKubeconfig} kubectl apply -f ${tempYaml}`]);

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
          fs.unlinkSync(tempYaml);
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
          fs.unlinkSync(tempYaml);
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
