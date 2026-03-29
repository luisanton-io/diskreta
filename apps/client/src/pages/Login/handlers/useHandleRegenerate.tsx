import { defaultSettings } from "constants/defaultSettings"
import { USER_DIGEST } from "constants/localStorage"
import { pki, util } from "node-forge"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "stores/auth"
import { useChatsStore } from "stores/chats"
import { useUIStore } from "stores/ui"
import { createSignedDigest } from "util/createDigest"
import generateKeyPair from "util/generateKeypair"

export default function useHandleRegenerate(nick: string, password: string) {
    const mnemonic = useRef("")

    const setUser = useAuthStore(state => state.setUser)
    const setChats = useChatsStore(state => state.setChats)
    const setDialog = useUIStore(state => state.setDialog)

    const navigate = useNavigate()

    const oldDigestEncrypted = localStorage.getItem(USER_DIGEST)


    const handleRegenerate = (encryptedToken: string, refreshToken: string, responseUser: User) => {
        if (oldDigestEncrypted && !window.confirm("Signing in with a new user will destroy all data associated with any previous user. Continue?")) {
            return
        }

        localStorage.clear()

        const doRegenerate = async (e?: React.FormEvent) => {
            e?.preventDefault()

            toast.promise(new Promise<void>((resolve) => {
                setTimeout(async () => {
                    const { privateKey } = await generateKeyPair(mnemonic.current)

                    const userWithoutDigest: Omit<LoggedUser, 'digest'> = {
                        ...responseUser,
                        token: privateKey.decrypt(util.decode64(encryptedToken)),
                        refreshToken,
                        privateKey: pki.privateKeyToPem(privateKey),
                        settings: defaultSettings
                    }

                    const newUser: LoggedUser = {
                        ...userWithoutDigest,
                        digest: createSignedDigest(userWithoutDigest, password).digest
                    }

                    setUser(newUser)
                    setChats({})
                    setDialog(null)
                    navigate("/")

                    resolve()
                }, 1000)
            }), {
                pending: "Generating your keys. This will take a while...",
                error: "Error generating your keys. Please try again.",
                success: "Your keys have been generated"
            })
        }

        setDialog({
            submitLabel: "Generate",
            Content: () => {
                return (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">Welcome to a new device. You need to regenerate your keypair in order to use Diskreta here.</p>
                        <p className="text-sm text-muted-foreground">Please note we do not store your messages and you will need to export them from your old device.</p>
                        <p className="text-sm text-muted-foreground">This feature is planned for upcoming releases.</p>
                        <p className="text-sm"><strong>If this is not your device,</strong> log out after your session to destroy your data.</p>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="regen-seed">Seed phrase</Label>
                            <Input id="regen-seed" type="text" placeholder="Enter your seed phrase" onChange={e => { mnemonic.current = e.target.value }} />
                        </div>
                    </div>
                )
            },
            onConfirm: doRegenerate
        })
    }

    return handleRegenerate

}
