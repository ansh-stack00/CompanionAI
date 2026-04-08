import dotenv from "dotenv";
dotenv.config({
    path: ".env.local"
});

import { Worker } from "bullmq"
import { getRedisConnection } from "../src/lib/redis.js";
import { supabaseAdmin } from "../src/lib/supabase/admin.js";

new Worker("inAppQueue" , async (job) => {
    if(job.name === "sendInAppNotification") {
        const { userId , title , message } = job.data
        console.log(`Processing in-app notification for user ${userId} with title: ${title} and message: ${message}`)

        await supabaseAdmin.from('notifications').insert(
            {
                user_id : userId,
                type:"todo_reminder",
                title,
                message,
            }
        )

        console.log(`In-app notification created for ${userId}`);
    }
},
{
    connection: getRedisConnection(),
}
)