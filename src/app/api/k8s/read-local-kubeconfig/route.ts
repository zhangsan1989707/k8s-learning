import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET() {
  try {
    const homeDir = os.homedir();
    const kubeconfigPath = path.join(homeDir, ".kube", "config");

    if (fs.existsSync(kubeconfigPath)) {
      const kubeconfig = fs.readFileSync(kubeconfigPath, "utf-8");
      return NextResponse.json({ kubeconfig });
    }

    return NextResponse.json({ kubeconfig: null });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
