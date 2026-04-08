import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRedisConnection } from "@/lib/redis";
import IORedis from "ioredis"

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
        console.log("No user found")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const redis = new IORedis(getRedisConnection())
    await redis.set(`heartbeat:${user.id}`, "true" , "EX" , 90)

    await redis.quit()

    return NextResponse.json({ userId: user.id , isOnline: true })

}

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
        console.log("No user found")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const redis = new IORedis(getRedisConnection())
    const online = await redis.get(`heartbeat:${user.id}`)
    await redis.quit();
    return NextResponse.json({
        isOnline: !!online
    });
}