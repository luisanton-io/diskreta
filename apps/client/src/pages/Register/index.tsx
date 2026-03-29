import API from "API";
import { AxiosError } from "axios";
import { generateMnemonic } from "bip39";
import { USER_DIGEST } from "constants/localStorage";
import { defaultSettings } from "constants/defaultSettings";
import { pki, util } from "node-forge";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "stores/auth";
import { useUIStore } from "stores/ui";
import { createDigest } from "util/createDigest";
import generateKeyPair from "util/generateKeypair";
import withHysteresis from "util/withHysteresis";
import SeedDialog from "./SeedDialog";

export default function Register() {
    const navigate = useNavigate();

    const setUser = useAuthStore((state) => state.setUser);
    const setDialog = useUIStore((state) => state.setDialog);

    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nickError, setNickError] = useState("");

    const checkNickAvailability = async () => {
        if (!nick.trim()) return;
        try {
            await API.get<User>(`/users?nick=${nick}&exact=true`);
            setNickError("This nickname is already taken.");
        } catch {
            setNickError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const userExists = await toast.promise(
            withHysteresis(
                (async () => {
                    try {
                        await API.get<User>(`/users?nick=${nick}&exact=true`);
                        return true;
                    } catch {
                        return false;
                    }
                })()
            ),
            {
                pending: "Checking availability...",
            }
        );

        if (userExists) {
            setLoading(false);
            setNickError("This nickname is already taken.");
            return toast.error(
                "Nick not available at this time. Please try with another one."
            );
        }

        setLoading(false);

        const mnemonic = generateMnemonic(256);
        setDialog({
            Content: () => <SeedDialog seed={mnemonic} />,
            onConfirm: () => {
                toast.promise(
                    new Promise<void>((resolve) => {
                        setTimeout(async () => {
                            await handleContinue(mnemonic);
                            resolve();
                        }, 1000);
                    }),
                    {
                        pending:
                            "Generating your keys. This will take a while! Please wait and don't leave the page.",
                        error: "Error generating your keys. Please try again.",
                        success: "Your keys have been generated",
                    }
                );
            },
            submitLabel: "I have saved my seed phrase",
        });
    };

    const handleContinue = async (mnemonic: string) => {
        const { privateKey, publicKey } = await generateKeyPair(mnemonic);
        const digest = createDigest(nick, password);

        const encryptedDigest = util.encode64(publicKey.encrypt(digest));

        localStorage.setItem(USER_DIGEST, encryptedDigest);

        try {
            const {
                data: { token: encryptedToken, refreshToken, user },
            } = await API.post<LoginResponse>("/users", {
                digest,
                nick,
                publicKey: pki.publicKeyToPem(publicKey),
            });

            const token = privateKey.decrypt(util.decode64(encryptedToken));

            const newUserState = {
                ...user,
                digest,
                token,
                refreshToken,
                privateKey: pki.privateKeyToPem(privateKey),
                settings: defaultSettings,
            };

            setUser(newUserState);
            navigate("/");
        } catch (error) {
            toast.error(
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : (error as Error).message
            );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <h1 className="font-mono text-3xl font-bold tracking-tight">
                        diskreta.
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create your account
                    </p>
                </CardHeader>

                <CardContent>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nick">Username</Label>
                            <Input
                                id="nick"
                                type="text"
                                placeholder="Choose a nickname"
                                value={nick}
                                onChange={(e) => {
                                    setNick(e.target.value);
                                    setNickError("");
                                }}
                                onBlur={checkNickAvailability}
                                required
                                autoComplete="username"
                            />
                            {nickError && (
                                <p className="text-xs text-destructive">
                                    {nickError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Choose a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    autoComplete="new-password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={loading}
                        >
                            {loading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Register
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        to="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Already have an account?{" "}
                        <span className="font-medium underline underline-offset-4">
                            Sign in
                        </span>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
