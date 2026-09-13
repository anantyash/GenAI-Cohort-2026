const { Queue } = require("bullmq");

const notificationQueue = new Queue("noti-queue");

async function init() {
  const res = await notificationQueue.add("email to user ", {
    email: "yashlab.in",
    subject: "Greetings",
    body: " hello Dude, Welcome to the Message Queue",
  });

  console.log("Job added to the queue with ID: ", res.id);
}

init();
