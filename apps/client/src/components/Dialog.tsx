import { Button } from "@/components/ui/button"
import {
    Dialog as ShadcnDialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useUIStore } from "stores/ui"

export default function Dialog() {
    const dialog = useUIStore(s => s.dialog)
    const setDialog = useUIStore(s => s.setDialog)

    const handleSubmit = () => {
        dialog?.onConfirm()
        setDialog(null)
    }

    return (
        <ShadcnDialog open={!!dialog} onOpenChange={(open) => { if (!open) setDialog(null) }}>
            {dialog && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialog.submitLabel === "Generate" ? "Account Recovery" : "Confirm"}
                        </DialogTitle>
                    </DialogHeader>
                    <dialog.Content />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialog(null)}>
                            {dialog.cancelLabel || "Cancel"}
                        </Button>
                        {dialog.submitLabel && (
                            <Button onClick={handleSubmit}>
                                {dialog.submitLabel}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            )}
        </ShadcnDialog>
    )
}
