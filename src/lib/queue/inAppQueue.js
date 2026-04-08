import { Queue } from "bullmq";
import { getRedisConnection } from "../redis.js";

export const inAppQueue = new Queue("inAppQueue" , {
    connection: getRedisConnection()
})