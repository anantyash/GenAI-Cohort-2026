const { Worker } = require("bullmq");

const sendMail = () =>
  new Promise((resolve, reject) => setTimeout(() => resolve(), 5000));

const worker = new Worker(
  "noti-queue",
  async (job) => {
    console.log("Processing job with ID: ", job.id);
    console.log("Sending mail to ", job.data.email);

    await sendMail();

    console.log("Email sent successfully for job ID: ", job.id);
  },
  { connection: { host: "localhost", port: 6379 } },
);
