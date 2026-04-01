import server from "./server"
import mongoose from "mongoose"

const { MONGO_URL, PORT, JWT_SECRET, JWT_REFRESH_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env

const required = { MONGO_URL, PORT, JWT_SECRET, JWT_REFRESH_SECRET }
const missing = Object.entries(required).filter(([, v]) => !v)
if (missing.length) {
    throw new Error(`Missing required env: ${missing.map(([k]) => k).join(", ")}`)
}

const vapid = { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL }
const missingVapid = Object.entries(vapid).filter(([, v]) => !v)
if (missingVapid.length) {
    console.warn(`⚠ Push notifications disabled — missing env: ${missingVapid.map(([k]) => k).join(", ")}`)
}

mongoose.connect(MONGO_URL!).then(() => {
    server.listen(PORT!, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
})
