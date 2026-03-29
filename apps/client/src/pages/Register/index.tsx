import API from "API";
import { AxiosError } from "axios"
import { dialogState } from "atoms/dialog";
import { userState } from "atoms/user";
import { generateMnemonic } from "bip39";
import Diskreta from "components/Diskreta";
import { USER_DIGEST } from "constants/localStorage";
import { pki, util } from "node-forge";
import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import { createDigest } from "util/createDigest";
import generateKeyPair from "util/generateKeypair";
import SeedDialog from "./SeedDialog";
import withHysteresis from "util/withHysteresis";
import { defaultSettings } from "constants/defaultSettings";

export default function Register() {

    const navigate = useNavigate()

    const setUser = useSetRecoilState(userState)
    const setDialog = useSetRecoilState(dialogState)

    const [nick, setNick] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)

    const handleToggleShowPwd = () => {
        setShowPwd(s => !s)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const userExists = await toast.promise(
            withHysteresis((async () => {
                try {
                    await API.get<User>(`/users?nick=${nick}&exact=true`)
                    return true
                } catch {
                    return false
                }

            })()),
            {
                pending: "Checking availability...",
            }
        )

        if (userExists) {
            return toast.error("Nick not available at this time. Please try with another one.")
        }

        const mnemonic = generateMnemonic(256)
        setDialog({
            Content: () => { return <SeedDialog seed={mnemonic} /> },
            onConfirm: () => {

                toast.promise(new Promise<void>((resolve) => {
                    setTimeout(async () => {
                        await handleContinue(mnemonic)

                        resolve()
                    }, 1000)

                }), {
                    pending: "Generating your keys. This will take a while! Please wait and don't leave the page.",
                    error: "Error generating your keys. Please try again.",
                    success: "Your keys have been generated"
                })

            },
            submitLabel: "Continue"
        })
    }

    const handleContinue = async (mnemonic: string) => {

        const { privateKey, publicKey } = await generateKeyPair(mnemonic)
        const digest = createDigest(nick, password)

        const encryptedDigest = util.encode64(publicKey.encrypt(digest))

        localStorage.setItem(USER_DIGEST, encryptedDigest)

        // console.table({ encryptedDigest, digest, eq: privateKey.decrypt(util.decode64(encryptedDigest)) === digest })

        try {
            const { data: {
                token: encryptedToken,
                refreshToken,
                user
            } } = await API.post<LoginResponse>("/users", { digest, nick, publicKey: pki.publicKeyToPem(publicKey) })

            const token = privateKey.decrypt(util.decode64(encryptedToken))

            const newUserState = {
                ...user,
                digest,
                token,
                refreshToken,
                privateKey: pki.privateKeyToPem(privateKey),
                settings: defaultSettings
            }

            setUser(newUserState)
            navigate("/")
        } catch (error) {
            toast.error(error instanceof AxiosError ? error.response?.data?.message : (error as Error).message)
        }
    }

    return <Container className="my-auto">
        <Row>
            <Col lg={4} className="mx-auto p-5 bg-dark">
                <div className="text-white"><Diskreta /></div>
                <h6 className="text-white text-center mb-3">Register</h6>

                <Form onSubmit={handleSubmit} className="enter-form d-flex flex-column">
                    <Form.Control
                        type="text"
                        className="rounded-0 mb-3 bg-transparent text-white"
                        value={nick}
                        onChange={e => setNick(e.target.value)}
                        placeholder="Nickname"
                        required
                    />

                    <InputGroup className="rounded-0 mb-1">

                        <Form.Control
                            required
                            className="rounded-0 bg-transparent text-white me-2"
                            type={showPwd ? "text" : "password"}
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            placeholder="Password"
                        />

                        <Button
                            variant="outline-secondary"
                            className="rounded-0 text-white d-flex align-items-center border-3"
                            onClick={handleToggleShowPwd}
                        >
                            {
                                showPwd
                                    ? <Eye className="text-warning" style={{ transform: 'scale(1.25)' }} />
                                    : <EyeSlash style={{ transform: 'scale(1.25)' }} />
                            }
                        </Button>
                    </InputGroup>

                    <Button
                        variant="outline-primary"
                        className="ms-auto w-50 my-3 rounded-0 font-monospace register border-3"
                        type="submit" >
                        Register
                    </Button>

                    <Link className="text-warning text-decoration-none" to={'/login'}>Already have an account?</Link>
                </Form>
            </Col>
        </Row>
    </Container>
}