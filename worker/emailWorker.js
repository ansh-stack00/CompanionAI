import dotenv from "dotenv";
dotenv.config({
    path: ".env.local"
});


import { Worker } from "bullmq";
import { getRedisConnection } from "../src/lib/redis.js";
import { sendWelcomeEmail , sendReminderEmail } from "../src/lib/email.js";
import Bottleneck from "bottleneck";
import { supabaseAdmin } from "../src/lib/supabase/admin.js";

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

    if(job.name === "sendEmailNotification") {
        const { userId , task , message } = job.data

        const { data: user , error } = await supabaseAdmin.auth.admin.getUserById(userId)
        if(!user?.user?.email ) {
            console.log(`User with ID ${userId} does not have an email address. Skipping email notification.`)
            return 
        }
        console.log(`Sending email notification to ${user.user.email} with task: ${task}`)

        await limiter.schedule( () => sendReminderEmail(user.user.email , message))
    }
},
{
    connection: getRedisConnection(),
})

console.log("Email worker started")