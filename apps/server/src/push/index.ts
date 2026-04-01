import express from "express"
import webpush from "web-push"
import { jwtGuard } from "../middlewares/jwtGuard"
import User from "../users/model"

const pushRouter = express.Router()

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_EMAIL) {
    webpush.setVapidDetails(
        `mailto:${VAPID_EMAIL}`,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    )
}

pushRouter.get("/vapid-public-key", (req, res) => {
    if (!VAPID_PUBLIC_KEY) {
        return res.status(503).json({ error: "Push notifications not configured" })
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY })
})

pushRouter.post("/subscribe", jwtGuard, async (req, res, next) => {
    try {
        const { endpoint, keys } = req.body

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ error: "Invalid push subscription" })
        }

        await User.findByIdAndUpdate(req.user, {
            pushSubscription: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }
        })

        res.status(201).json({ message: "Subscribed" })
    } catch (error) {
        next(error)
    }
})

pushRouter.delete("/unsubscribe", jwtGuard, async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user, {
            $unset: { pushSubscription: 1 }
        })

        res.status(200).json({ message: "Unsubscribed" })
    } catch (error) {
        next(error)
    }
})

export async function sendPushNotification(userId: string): Promise<void> {
    const user = await User.findById(userId)
    if (!user?.pushSubscription) return

    const payload = JSON.stringify({
        title: "New message",
        body: "You have a new encrypted message"
    })

    try {
        await webpush.sendNotification(user.pushSubscription, payload)
    } catch (error: any) {
        // Remove expired/invalid subscriptions (410 Gone, 404 Not Found)
        if (error.statusCode === 410 || error.statusCode === 404) {
            await User.findByIdAndUpdate(userId, {
                $unset: { pushSubscription: 1 }
            })
        }
        console.error("Push notification failed:", error.statusCode || error.message)
    }
}

export default pushRouter
