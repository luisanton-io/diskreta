import API from "API";
import { dialogState } from "atoms/dialog";
import { USER_DIGEST } from "constants/localStorage";
import { useRef } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import withHysteresis from "util/withHysteresis";
import useHandleMnemonicSubmit from "./useHandleMnemonicSubmit";

export default function useHandleRecovery(nick: string, password: string) {


    const setDialog = useSetRecoilState(dialogState)

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
                    <Form className="p-5" onSubmit={handleMnemonicSubmit(responseUser)}>
                        {
                            oldDigestEncrypted
                                ?
                                <>
                                    <p>If you were previously logged in this device, you can recover your data here.</p>
                                    <p>You need to regenerate your keypair in order to do so.</p>
                                </>
                                :
                                <>
                                    <p>No previous user data was found on this device. In order to restore your message you will need to export them from the device your were previously using.</p>
                                    <p>This feature is planned for a future release of Diskreta.</p>
                                </>
                        }
                        <strong>Please insert your 24 words mnemonic here separated by white space.</strong>
                        <Form.Control className="d-inline-block rounded-0 my-4" type="text" placeholder="Seed" onChange={e => { mnemonic.current = e.target.value }} />
                    </Form>
                )
            },
            onConfirm: handleMnemonicSubmit(responseUser)
        })
    }

    return handleRecovery
}