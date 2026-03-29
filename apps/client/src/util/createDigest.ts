import forge, { pki, util } from "node-forge"
import { USER_DIGEST } from "constants/localStorage"


export function createDigest(nick: string, password: string) {
    const md = forge.md.sha512.create()
    md.update(nick + password)
    return util.encode64(md.digest().bytes())
}

export function createSignedDigest(user: CurrentUser, password: string) {
    const md = forge.md.sha512.create()

    const publicKey = pki.publicKeyFromPem(user.publicKey)
    const privateKey = pki.privateKeyFromPem(user.privateKey)

    md.update(user.nick + password)

    const digest = util.encode64(md.digest().bytes())
    const signedDigest = util.encode64(privateKey.sign(md))

    // here we are saving the current digest in localStorage encrypted with the user's public key
    const encryptedDigest = util.encode64(publicKey.encrypt(digest))

    localStorage.setItem(USER_DIGEST, encryptedDigest)

    return { digest, signedDigest }
}