import { userState } from "atoms/user";
import { chatsState, defaultChats } from "atoms/chats";
import { dialogState } from "atoms/dialog";
import { USER_DIGEST } from "constants/localStorage";
import { pki, util } from "node-forge";
import { useRef } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import decryptLocalStorage from "util/decryptLocalStorage";
import generateKeyPair from "util/generateKeypair";
import withHysteresis from "util/withHysteresis";
import useHandleDigestUpdate from "./useHandleDigestUpdate";
import { defaultSettings } from "constants/defaultSettings";

export default function useHandleMnemonicSubmit(mnemonic: React.MutableRefObject<string>) {

    const handleDigestUpdate = useHandleDigestUpdate()

    const setUser = useSetRecoilState(userState)
    const setChats = useSetRecoilState(chatsState)
    const setDialog = useSetRecoilState(dialogState)

    const navigate = useNavigate()

    const newPassword = useRef("")

    const oldDigestEncrypted = localStorage.getItem(USER_DIGEST)


    const handleMnemonicSubmit = (responseUser: User) => async (e?: React.FormEvent) => {

        e?.preventDefault()

        const { nick } = responseUser

        console.log(mnemonic.current)

        toast.promise(new Promise<{ publicKey: pki.rsa.PublicKey, privateKey: pki.rsa.PrivateKey }>((resolve, reject) => {
            if (mnemonic.current.split(' ').length !== 24) return reject()

            setTimeout(async () => {
                resolve(await generateKeyPair(mnemonic.current))
            }, 1000)

        }), {
            pending: "Generating your keys. This will take a while...",
            error: "Error generating your keys. Please make sure your seed is correct and 24 words long.",
            success: "Your keys have been generated"
        })
            .then(({ privateKey, publicKey }) => {
                // Fake promise for UX
                return toast.promise(
                    withHysteresis(
                        (async () =>
                            responseUser.publicKey === pki.publicKeyToPem(publicKey)
                                ? privateKey
                                : Promise.reject()
                        )()
                    )
                    ,
                    {
                        pending: "Checking key match...",
                        error: nick + "'s keys were not generated using this mnemonic.",
                        success: "Generated keys match. Please enter a new password."
                    },
                )
            })
            .then((privateKey) => {

                // From now we can safely assume that the keys for user {nick} were generated using the same mnemonic

                // However, _before_ setting recoil let's first make sure there wasn't a previous user logged in 
                // That is to give chance to the current user to NOT delete the previous user data inadvertently

                if (oldDigestEncrypted) try {

                    const oldDigest = privateKey.decrypt(util.decode64(oldDigestEncrypted)) //throws
                    return decryptLocalStorage(oldDigest) //throws

                } catch (error) {
                    console.log(error)
                    if (window.confirm(`
                    Error decrypting previous user data. Apparently, ${nick} was not the last logged in user on this device.
                    Press OK if you wish to continue generating the keys with this seed and delete all previous data.
                    `)) {
                        localStorage.clear()
                    } else return Promise.reject()
                }

                return {
                    user: {
                        ...responseUser,
                        privateKey: pki.privateKeyToPem(privateKey),
                        settings: defaultSettings
                    },
                    chats: defaultChats
                }

            })
            .then(({ user, chats }) => {

                // Here we will calc new digest, send to server signed, get a JWT back.

                const handleNewPasswordSubmit = async (e?: React.FormEvent) => {
                    e?.preventDefault()
                    try {

                        const { token, refreshToken, digest } = await handleDigestUpdate(user, newPassword.current)

                        // login with new digest 
                        setUser({
                            ...user,
                            digest,
                            token,
                            refreshToken
                        })

                        setChats(chats) // either the old chats or the default if error
                        setDialog(null)
                        navigate("/")

                    } catch (error) {
                        toast.error((error as Error).message)
                    }
                }

                setDialog({
                    submitLabel: "Confirm",
                    Content: () => (
                        <Form className="p-5" onSubmit={handleNewPasswordSubmit}>
                            <Form.Control
                                type="password"
                                className="rounded-0"
                                placeholder="New password"
                                onChange={e => { newPassword.current = e.target.value }}
                            />
                        </Form>
                    ),
                    onConfirm: handleNewPasswordSubmit
                })
            })
            .catch(console.error)
    }

    return handleMnemonicSubmit
}