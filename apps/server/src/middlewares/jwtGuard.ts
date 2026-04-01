import { RequestHandler } from "express"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"

export const jwtGuard: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({
            error: "No token provided"
        })
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader
    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        req.user = _id
        next()
    } catch (e: any) {
        console.error(`[jwtGuard] 401 on ${req.method} ${req.path} — ${e.message}`)
        console.error(`[jwtGuard] token (first 50 chars): ${token.substring(0, 50)}...`)
        next(createHttpError(401, "SESSION_EXPIRED"))
    }

}
