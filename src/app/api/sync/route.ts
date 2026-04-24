import { NextResponse } from "next/server";
import { syncAllSources } from "@/lib/scrapers";

export async function POST() {
  try {
    console.log("Starting manual sync...");

    const result = await syncAllSources();

    console.log(`Sync completed: ${result.newCount} new, ${result.updatedCount} updated, ${result.errorCount} errors`);

    return NextResponse.json({
      success: true,
      ...result,
      message: `同步完成：新增 ${result.newCount} 条，更新 ${result.updatedCount} 条，失败 ${result.errorCount} 条`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "同步失败",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return last sync info (you might want to store this in a separate table)
    return NextResponse.json({
      success: true,
      message: "Use POST to trigger sync",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
