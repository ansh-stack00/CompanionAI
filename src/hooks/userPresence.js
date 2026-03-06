"use client"

import { useEffect } from "react"
export function UserPresence() {
    useEffect(() => {
        const sendHeartbeat = async () => {
            await fetch("/api/sendHeartbeat", {
                method: "POST"
            })
        }
        sendHeartbeat()
        const interval = setInterval(sendHeartbeat, 30000) // Send heartbeat every 30 seconds
        return () => clearInterval(interval)
    }, [])
}

export function UserProvider() {
    UserPresence()
    return null
}