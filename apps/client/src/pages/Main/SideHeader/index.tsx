import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useUIStore } from "stores/ui";
import SearchDialog from "./SearchDialog";
import Settings from "../Settings";


export default function SideHeader() {

    const setDialog = useUIStore(s => s.setDialog)

    const handleShowSearchDialog = () => {
        setDialog({
            Content: SearchDialog,
            onConfirm: () => setDialog(null),
            cancelLabel: "Close"
        })
    }

    return <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight text-foreground">diskreta.</h1>
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShowSearchDialog}
                title="New chat"
            >
                <MessageSquarePlus className="h-5 w-5" />
            </Button>
            <Settings />
        </div>
    </div>
}
