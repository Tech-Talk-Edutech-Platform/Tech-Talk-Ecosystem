const cron = require("node-cron");
const sendReminders = require("./services/smsService");

// run every minute
cron.schedule("* * * * *", async () => {
  console.log("Checking upcoming classes...");
  await sendReminders();
});