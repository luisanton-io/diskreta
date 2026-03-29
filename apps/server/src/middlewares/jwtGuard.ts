import { RequestHandler } from "express"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"

export const jwtGuard: RequestHandler = (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
        return res.status(401).json({
            error: "No token provided"
        })
    }
    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        req.user = _id
        next()
    } catch (e) {
        next(createHttpError(401, "SESSION_EXPIRED"))
    }

}
