import server from "./server"
import mongoose from "mongoose"

const { MONGO_URL, PORT } = process.env
const missing = Object.entries({ MONGO_URL, PORT }).filter(([k, v]) => !v)

if (missing.length) {
    throw new Error(`Missing env: ${missing[0].join(", ")}`)
}

mongoose.connect(MONGO_URL!).then(() => {
    server.listen(PORT!, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
})
