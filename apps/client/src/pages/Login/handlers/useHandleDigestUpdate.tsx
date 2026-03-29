import API from "API"
import { pki, util } from "node-forge"
import { createSignedDigest } from "util/createDigest"

export default function useHandleDigestUpdate() {
    const handleDigestUpdate = async (user: CurrentUser, newPassword: string) => {

        const { digest, signedDigest } = createSignedDigest(user, newPassword)

        console.table({ digest, signedDigest })

        // PUT user's digest sending the new digest signed with the PRIVATE key
        // the server will be able to verify the sender identity verifying with the PUBLIC key.
        try {
            const { data: {
                token: encryptedToken,
                refreshToken
            } } = await API.put<LoginResponse>('/users', {
                nick: user.nick,
                digest,
                signedDigest
            })

            return {
                digest,
                token: pki.privateKeyFromPem(user.privateKey).decrypt(util.decode64(encryptedToken)),
                refreshToken
            }
        } catch (error) {
            throw new Error("Error updating user. Please try again later.")
        }

    }

    return handleDigestUpdate
}