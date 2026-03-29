import API from "API"
import { AxiosError } from "axios"
import { defaultSettings } from "constants/defaultSettings"
import { pki, util } from "node-forge"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuthStore } from "stores/auth"
import { useChatsStore } from "stores/chats"
import { setEncryptionDigest } from "stores/middleware/encrypted-storage"
import { createDigest } from "util/createDigest"
import useHandleRegenerate from "./useHandleRegenerate"

export default function useHandleSubmit(nick: string, password: string) {

    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleRegenerate = useHandleRegenerate(nick, password)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!nick || !password) {
                return toast.error("Credentials missing")
            }

            const digest = createDigest(nick, password)

            const toastId = toast.info("Connecting...")

            const {
                data: { token: encryptedToken, refreshToken, user: responseUser }
            } = await API.post<LoginResponse>("/users/session", { nick, digest })

            // Rehydrate Zustand stores from encrypted localStorage
            try {
                toast.update(toastId, { render: "Decrypting user data..." })

                setEncryptionDigest(digest)
                useAuthStore.persist.rehydrate()
                useChatsStore.persist.rehydrate()

                const hydratedUser = useAuthStore.getState().user

                if (!hydratedUser?.privateKey) {
                    throw new Error("No private key found in stored data")
                }

                const token = pki.privateKeyFromPem(hydratedUser.privateKey).decrypt(util.decode64(encryptedToken))

                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        useAuthStore.getState().setUser({
                            // @ts-ignore - defaultSettings for retrocompatibility for users who didn't have settings in previous versions
                            settings: defaultSettings,
                            ...hydratedUser,
                            token,
                            refreshToken
                        })

                        navigate("/")
                        toast.dismiss()
                        resolve()

                    }, 1000)
                })
            } catch {
                toast.update(toastId, { render: "User data decryption failed. Regenerate keys?", type: "error" })
                handleRegenerate(encryptedToken, refreshToken, responseUser)
            }

        } catch (error) {
            toast.error(
                error instanceof AxiosError
                    ? error.response?.data?.error
                    : (error as Error).message
            )

        } finally {
            setLoading(false)
        }
    }

    return { handleSubmit, loading }
}
