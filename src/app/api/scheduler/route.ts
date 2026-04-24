import { NextRequest, NextResponse } from "next/server";
import { startScheduler, stopScheduler, getSchedulerStatus } from "@/lib/sync/scheduler";

let schedulerStarted = false;

export async function GET() {
  const status = getSchedulerStatus();
  return NextResponse.json({
    ...status,
    message: status.running ? "调度器正在运行" : "调度器未运行",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cronExpression } = body;

    if (action === "start") {
      startScheduler({
        cronExpression: cronExpression || "0 */6 * * *",
        enabled: true,
      });
      schedulerStarted = true;
      return NextResponse.json({
        success: true,
        message: "调度器已启动",
      });
    }

    if (action === "stop") {
      stopScheduler();
      schedulerStarted = false;
      return NextResponse.json({
        success: true,
        message: "调度器已停止",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'start' or 'stop'" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
