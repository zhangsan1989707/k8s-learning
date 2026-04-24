import cron from "node-cron";
import { syncAllSources } from "@/lib/scrapers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scheduledTask: any = null;

export interface SchedulerConfig {
  cronExpression?: string;
  enabled?: boolean;
}

export function startScheduler(config: SchedulerConfig = {}): void {
  const { cronExpression = "0 */6 * * *", enabled = true } = config;

  if (!enabled) {
    console.log("Scheduler is disabled");
    return;
  }

  if (scheduledTask) {
    console.log("Scheduler already running");
    return;
  }

  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression: ${cronExpression}`);
    return;
  }

  console.log(`Starting sync scheduler with expression: ${cronExpression}`);

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log("Running scheduled sync...");
    try {
      const result = await syncAllSources();
      console.log(
        `Scheduled sync completed: ${result.newCount} new, ${result.updatedCount} updated, ${result.errorCount} errors`
      );
    } catch (error) {
      console.error("Scheduled sync failed:", error);
    }
  });

  scheduledTask.start();
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("Scheduler stopped");
  }
}

export function getSchedulerStatus(): {
  running: boolean;
  expression?: string;
} {
  return {
    running: scheduledTask !== null,
  };
}
