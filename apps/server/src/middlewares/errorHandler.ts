import { ErrorRequestHandler } from "express"
import { HttpError } from "http-errors"

const genericErrorHandler: ErrorRequestHandler = (err, req, res, next) => {

    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            error: err.message
        })
    }

    console.error(err)
    return res.status(500).json({
        error: "Internal server error"
    })
}

export default genericErrorHandler