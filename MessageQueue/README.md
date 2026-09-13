# 📬 Message Queue — BullMQ

A simple **Message Queue** example using **Node.js, BullMQ, and Redis**.

For more information on Message Queue, check out [MessageQueue.md](MessageQueue.md).

The project demonstrates how a **Producer** adds a job to a queue and a **Worker** picks up that job and processes it.

---

## 🏗️ How This Project Works

```text
              add job
┌──────────┐ ───────────► ┌────────────┐
│ Producer │               │   Queue    │
└──────────┘               │ noti-queue │
                           └──────┬─────┘
                                  │
                                  │ process job
                                  ▼
                           ┌────────────┐
                           │   Worker   │
                           └──────┬─────┘
                                  │
                                  ▼
                              📧 Email
```

### In simple words:

- **Producer** → creates a job
- **Queue** → keeps the job waiting
- **Worker** → takes the job and processes it
- **Redis** → stores the queue and job information

---

## 📁 Project Structure

```text
.
├── producer.js     # Adds jobs to the queue
├── worker.js       # Processes jobs
└── package.json    # Project dependencies
```

---

## ⚙️ Installation

### 1. Install dependencies

```bash
npm i bullmq ioredis
```

This project uses:

```text
bullmq
ioredis
```

### 3. Start Redis

Make sure Redis is running on:

```text
localhost:6379
```

I use Redis Docker image for this project:

---

## ▶️ Run the Project

You need **two terminals**.

### Terminal 1 — Start the Worker

```bash
node worker.js
```

The Worker connects to Redis and waits for jobs from `noti-queue`.

### Terminal 2 — Start the Producer

```bash
node producer.js
```

The Producer adds an email job to `noti-queue`.

---

## 🔄 What Happens?

When you run:

```bash
node producer.js
```

the Producer creates a job:

```text
📨 Email Job

email:   yashlab.in
subject: Greetings
body:    Hello Dude, Welcome to the Message Queue
```

The job goes into:

```text
📬 noti-queue
```

Then the Worker picks it up:

```text
Producer
   ↓
📬 noti-queue
   ↓
Worker
   ↓
📧 Send Email
   ↓
✅ Completed
```

The Worker in this demo simulates sending an email by waiting **5 seconds** before marking the job as completed.

---

## 🧠 The Main Idea

Instead of doing everything immediately:

```text
API → Send Email → Response
```

we can do:

```text
API → Queue → Response
             ↓
           Worker
             ↓
          Send Email
```

> **Message Queue = Put the work in a line and let a Worker handle it later.**
