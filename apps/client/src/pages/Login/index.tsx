import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useHandleRecovery from "./handlers/useHandleRecovery";
import useHandleSubmit from "./handlers/useHandleSubmit";

export default function Login() {
    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { handleSubmit, loading } = useHandleSubmit(nick, password);
    const handleRecovery = useHandleRecovery(nick, password);

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <h1 className="font-mono text-3xl font-bold tracking-tight">
                        diskreta.
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </CardHeader>

                <CardContent>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                        id="login-form"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nick">Username</Label>
                            <Input
                                id="nick"
                                type="text"
                                placeholder="Enter your username"
                                value={nick}
                                onChange={(e) => setNick(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
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

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                Sign in
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRecovery}
                            >
                                Recover
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        to="/register"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Don&apos;t have an account?{" "}
                        <span className="font-medium underline underline-offset-4">
                            Create one
                        </span>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
