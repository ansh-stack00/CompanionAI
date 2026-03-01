import dotenv from "dotenv";
dotenv.config({
    path: ".env.local"
});


import { Worker } from "bullmq";
import { getRedisConnection } from "../src/lib/redis.js";
import { sendWelcomeEmail } from "../src/lib/email.js";
import Bottleneck from "bottleneck";

console.log(process.env.UPSTASH_REDIS_URL);
const limiter = new Bottleneck({
    minTime: 700
})

new Worker("emailQueue", async(job) => {
    if (job.name === "sendWelcomeEmail") {
        const { email  } = job.data;
        console.log(`Sending welcome email to ${email}`);

        await limiter.schedule(() => sendWelcomeEmail(email))
    }
},
{
    connection: getRedisConnection(),
})

console.log("Email worker started")