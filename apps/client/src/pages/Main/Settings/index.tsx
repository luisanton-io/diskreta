import { Button } from "@/components/ui/button";
import { DialogClose } from "components/Dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { useUIStore } from "stores/ui";
import ManageData from "./Sections/ManageData";
import SessionTimeout from "./Sections/SessionTimeout";
import Theme from "./Sections/Theme";

function SettingsDialogContent() {
    return <div id="settings" className="py-4 position-relative">
        <DialogClose />
        <Theme />
        <SessionTimeout />
        <ManageData />
    </div>
}

export default function Settings() {
    const setDialog = useUIStore(s => s.setDialog)

    const openDialog = () => {
        setDialog({
            Content: SettingsDialogContent,
            onConfirm: () => setDialog(null)
        })
    }
    return (
        <Button variant="ghost" size="icon" onClick={openDialog} title="Settings">
            <SettingsIcon className="h-5 w-5" />
        </Button>
    )
}
