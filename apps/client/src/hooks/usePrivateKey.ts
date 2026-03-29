import { userState } from "atoms/user"
import { pki } from "node-forge"
import { useMemo } from "react"
import { useRecoilValue } from "recoil"

export default function usePrivateKey() {
    const user = useRecoilValue(userState)
    const privateKey = useMemo(() => {
        try {
            return (!user?.privateKey) ? null : pki.privateKeyFromPem(user.privateKey)
        } catch {
            return null
        }
    }, [user])

    return privateKey
}