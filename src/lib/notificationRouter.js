import { getRedisConnection } from "./redis.js";
import { emailQueue } from "./queue/emailQueue.js";
import { inAppQueue } from "./queue/inAppQueue.js";
import IORedis from "ioredis"

export async function addNotificationToQueue(userId , payload) {
    const redis =  new IORedis(getRedisConnection())
    const isOnline =  await redis.get(`heartbeat:${userId}`)

    if( isOnline ) {
        console.log("User ONLINE : Queue inApp notification")
        await inAppQueue.add("sendInAppNotification" , {
            userId,
            ...payload
        })
    }

    else {
        console.log("User OFFLINE : Queue email notification")
        await emailQueue.add("sendEmailNotification" , {
            userId,
            ...payload
        })
    }

}