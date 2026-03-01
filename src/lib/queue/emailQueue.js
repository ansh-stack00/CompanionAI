import { Queue } from "bullmq";
import { getRedisConnection } from "../redis";

export const emailQueue = new Queue("emailQueue" , {
    connection: getRedisConnection()
})
