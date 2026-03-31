import API from "API";
import { AxiosError } from "axios";
import { CHATS, USER, USER_DIGEST } from "constants/localStorage";
import { Bell, BellOff, Download, LogOut, Settings as SettingsIcon, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "stores/auth";
import { subscribeToPush, unsubscribeFromPush } from "util/pushNotifications";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const STORAGE_KEYS = [CHATS, USER, USER_DIGEST];

function applyTheme(theme: Theme) {
    const html = document.documentElement;
    if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        html.classList.toggle("dark", prefersDark);
    } else {
        html.classList.toggle("dark", theme === "dark");
    }
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            {children}
        </div>
    );
}

export default function Settings() {
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const theme = useAuthStore(s => s.user?.settings.theme ?? "dark") as Theme;
    const sessionTimeout = useAuthStore(s => s.user?.settings.sessionTimeout ?? 15);
    const pushEnabled = useAuthStore(s => s.user?.settings.pushNotificationsEnabled ?? true);
    const updateSettings = useAuthStore(s => s.updateSettings);
    const importedDataRef = useRef("");

    const handlePushToggle = async () => {
        if (pushEnabled) {
            await unsubscribeFromPush();
            updateSettings({ pushNotificationsEnabled: false });
        } else {
            const success = await subscribeToPush();
            if (success) {
                updateSettings({ pushNotificationsEnabled: true });
            }
        }
    };

    const handleThemeChange = (value: Theme) => {
        updateSettings({ theme: value });
        applyTheme(value);
    };

    const handleExportData = async () => {
        try {
            const data: Record<string, string> = {};
            STORAGE_KEYS.forEach(key => {
                const val = localStorage.getItem(key);
                if (!val) throw new Error(`Missing key`);
                data[key] = val;
            });
            await navigator.clipboard.writeText(JSON.stringify(data));
            setError("");
            alert("Data copied to clipboard. This data is encrypted and can only be decrypted using Diskreta with your recovery phrase.");
        } catch {
            setError("Failed to export data.");
        }
    };

    const handleImportData = () => {
        try {
            const data = JSON.parse(importedDataRef.current);
            STORAGE_KEYS.forEach(key => {
                if (!data[key]) throw new Error(`Missing key "${key}"`);
            });
            STORAGE_KEYS.forEach(key => {
                localStorage.setItem(key, data[key]);
            });
            window.location.reload();
        } catch {
            setError("Corrupted data. Please try exporting again.");
        }
    };

    const handleLogout = async () => {
        await unsubscribeFromPush();
        window.location.reload();
    };

    const handleDeleteAccount = async () => {
        try {
            await unsubscribeFromPush();
            await API.delete("/users/me");
            localStorage.clear();
            navigate("/register");
        } catch (err) {
            setError(err instanceof AxiosError ? err.response?.data?.error : (err as Error).message);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Settings">
                        <SettingsIcon className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-2">
                        {/* Theme */}
                        <Section title="Theme">
                            <Select value={theme} onValueChange={handleThemeChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </Section>

                        {/* Session Timeout */}
                        <Section title="Session Timeout">
                            <p className="text-sm text-muted-foreground">
                                Time before the app logs you out when inactive.
                            </p>
                            <Select
                                value={String(sessionTimeout)}
                                onValueChange={v => updateSettings({ sessionTimeout: parseInt(v) })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 seconds</SelectItem>
                                    <SelectItem value="60">1 minute</SelectItem>
                                    <SelectItem value="600">10 minutes</SelectItem>
                                    <SelectItem value="3600">1 hour</SelectItem>
                                    <SelectItem value="0">Never</SelectItem>
                                </SelectContent>
                            </Select>
                        </Section>

                        {/* Push Notifications */}
                        <Section title="Push Notifications">
                            <p className="text-sm text-muted-foreground">
                                Receive notifications when you get a message while the app is in the background.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={handlePushToggle}
                            >
                                {pushEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                                {pushEnabled ? "Notifications enabled" : "Notifications disabled"}
                            </Button>
                        </Section>

                        {/* Manage Data */}
                        <Section title="Manage Data">
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={handleExportData}
                                >
                                    <Upload className="h-4 w-4" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        importedDataRef.current = "";
                                        setError("");
                                        setImportOpen(true);
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    Import
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </div>
                            {error && (
                                <p className="text-sm text-destructive mt-2">{error}</p>
                            )}
                        </Section>

                        {/* Logout */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-muted-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Account Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to remove ALL your account data. You will NEVER be able to recover your data. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteAccount}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Data Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Paste your exported data below and click Import.
                    </p>
                    <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onChange={e => { importedDataRef.current = e.target.value; }}
                        placeholder="Paste exported JSON here..."
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={handleImportData}>Import</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
