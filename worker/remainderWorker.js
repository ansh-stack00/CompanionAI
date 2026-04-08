import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Worker } from "bullmq";
import { reminderQueue } from "../src/lib/queue/remianderQueue.js";
import { getRedisConnection } from "../src/lib/redis.js";
import { supabaseAdmin } from "../src/lib/supabase/admin.js";
import { addNotificationToQueue } from "../src/lib/notificationRouter.js"

new Worker(
  "reminderQueue",
  async () => {
    console.log("Checking for due todos...");

    const { data: todos, error } = await supabaseAdmin
      .from("todos")
      .select("*")
      .eq("completed", false)
    //   .eq("reminder_sent", false)
    //   .lte("due_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching todos:", error);
      return;
    }

    if (!todos || todos.length === 0) {
      console.log("No due todos found.");
      return;
    }

    for (const todo of todos) {
      console.log("Sending reminder for:", todo.task);

      await addNotificationToQueue(todo.user_id, {
        task: todo.task,
        message: `You haven't completed: ${todo.task}`,
      });

    //   await supabaseAdmin
    //     .from("todos")
    //     .update({ reminder_sent: true })
    //     .eq("id", todo.id);
    }
  },
  {
    connection: getRedisConnection(),
  }
);

console.log("Reminder worker started");

setInterval(async () => {
    console.log("Adding job to check todos...")
  await reminderQueue.add("checkTodos", {});
}, 60 * 1000); 