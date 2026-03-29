import mongoose, { Document } from "mongoose"
import bcrypt from "bcrypt"
import { pki } from "node-forge"
import { makeEmptyQueues } from "../shared"

type UserDocument = User & Document & {
    checkDigest(password: string): Promise<boolean>
}

interface UserModel extends mongoose.Model<UserDocument> {
    findByCredentials(nick: string): Promise<UserDocument>
}

const UserSchema = new mongoose.Schema<UserDocument, UserModel>({
    nick: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true
    },
    digest: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    queues: {
        type: Object, // avoiding Schema definition for Messages
        default: makeEmptyQueues() as Object
    }
})

UserSchema.statics.findByCredentials = async function (nick: string, password: string) {
    const user = await this.findOne({ nick })

    if (!user) {
        return Promise.reject(new Error("User not found"))
    }

    if (!(await user.checkDigest(password))) {
        return Promise.reject(new Error("Invalid credentials"))
    }

    return user
}

UserSchema.methods.toJSON = function () {
    const user = this.toObject()

    delete user.digest
    delete user.__v
    delete user.refreshToken
    delete user.queues

    return user
}

UserSchema.methods.checkDigest = function (digest: string) {
    return bcrypt.compare(digest, this.digest)
}

UserSchema.methods.encrypt = function (plain: string) {
    const publicKey = pki.publicKeyFromPem(this.publicKey)
    return publicKey.encrypt(plain)
}

// UserSchema.methods.verify = function (signed: string) {
//     const publicKey = pki.publicKeyFromPem(this.publicKey)
//     return publicKey.verify(signed)
// }


const User = mongoose.model("users", UserSchema)

export default User