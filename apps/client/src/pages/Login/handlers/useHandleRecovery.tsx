import API from "API";
import { USER_DIGEST } from "constants/localStorage";
import { useRef } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "stores/ui";
import withHysteresis from "util/withHysteresis";
import useHandleMnemonicSubmit from "./useHandleMnemonicSubmit";

export default function useHandleRecovery(nick: string, password: string) {

    const setDialog = useUIStore(state => state.setDialog)

    const mnemonic = useRef("")

    const oldDigestEncrypted = localStorage.getItem(USER_DIGEST)

    const handleMnemonicSubmit = useHandleMnemonicSubmit(mnemonic)

    const handleRecovery = async () => {
        console.log("handleRecovery")

        if (!nick) {
            return toast.error("Please enter your nickname")
        }

        let responseUser: User

        try {
            ({ data: responseUser } = await toast.promise(
                withHysteresis(API.get<User>(`/users?nick=${nick}&exact=true`)),
                {
                    pending: `Looking for ${nick}...`,
                    error: `Can't reach server. Please try again later.`,
                }))

        } catch {
            return toast.error("User not found")
        }

        setDialog({
            submitLabel: "Generate",
            Content: () => {
                return (
                    <div className="flex flex-col gap-4">
                        {
                            oldDigestEncrypted
                                ?
                                <>
                                    <p className="text-sm text-muted-foreground">If you were previously logged in on this device, you can recover your data here.</p>
                                    <p className="text-sm text-muted-foreground">You need to regenerate your keypair in order to do so.</p>
                                </>
                                :
                                <>
                                    <p className="text-sm text-muted-foreground">No previous user data was found on this device. In order to restore your messages you will need to export them from the device you were previously using.</p>
                                    <p className="text-sm text-muted-foreground">This feature is planned for a future release of Diskreta.</p>
                                </>
                        }
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="mnemonic" className="font-semibold">Please insert your 24 words mnemonic here separated by white space.</Label>
                            <Input id="mnemonic" type="text" placeholder="Enter your seed phrase" onChange={e => { mnemonic.current = e.target.value }} />
                        </div>
                    </div>
                )
            },
            onConfirm: handleMnemonicSubmit(responseUser)
        })
    }

    return handleRecovery
}
