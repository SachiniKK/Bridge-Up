const taskService = require('../services/taskService');

let cron;
try {
  cron = require('node-cron');
} catch (e) {
  console.warn("node-cron package not found. Using fallback vanilla JS interval scheduler for background tasks.");
  // Polyfill node-cron interface
  cron = {
    schedule: (cronExpression, callback) => {
      const parts = cronExpression.split(' ');
      const min = parseInt(parts[0], 10) || 5;
      const hour = parseInt(parts[1], 10) || 0;
      
      setInterval(async () => {
        const now = new Date();
        if (now.getUTCHours() === hour && now.getUTCMinutes() === min) {
          console.log(`[Scheduled Job] Triggering at ${now.toUTCString()}`);
          try {
            await callback();
          } catch (err) {
            console.error("[Scheduled Job Error]:", err);
          }
        }
      }, 60 * 1000);
      
      return {
        start: () => {},
        stop: () => {}
      };
    }
  };
}

function initDailyTaskScheduler() {
  // Cron expression for 00:05 daily server time (UTC)
  // Format: minute hour day-of-month month day-of-week
  const cronExpression = '5 0 * * *';
  
  console.log(`[Scheduler] Registering Daily Task & Streak Penalty job for 00:05 UTC.`);
  
  const job = cron.schedule(cronExpression, async () => {
    console.log('[Scheduler] Executing daily tasks regeneration and expiration job...');
    try {
      const result = await taskService.regenerateTomorrowsTasks();
      console.log('[Scheduler] Daily task job completed successfully:', JSON.stringify(result));
    } catch (err) {
      console.error('[Scheduler ERROR] Daily task job failed:', err);
    }
  });

  job.start();
}

module.exports = {
  initDailyTaskScheduler
};
