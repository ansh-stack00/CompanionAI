import { Queue } from "bullmq";
import { getRedisConnection } from "../redis.js";

export const reminderQueue = new Queue("reminderQueue", {
  connection: getRedisConnection(),
});

