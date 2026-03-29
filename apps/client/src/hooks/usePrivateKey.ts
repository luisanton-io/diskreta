import { useAuthStore } from "stores/auth"
import { pki } from "node-forge"
import { useMemo } from "react"

export default function usePrivateKey() {
    const user = useAuthStore(state => state.user)
    const privateKey = useMemo(() => {
        try {
            return (!user?.privateKey) ? null : pki.privateKeyFromPem(user.privateKey)
        } catch {
            return null
        }
    }, [user])

    return privateKey
}
