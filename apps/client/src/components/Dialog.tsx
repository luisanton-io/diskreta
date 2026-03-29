import { Button, Container, Modal } from "react-bootstrap"
import { Close } from "@mui/icons-material"
import { useUIStore } from "stores/ui"

export function DialogClose() {
    const setDialog = useUIStore(s => s.setDialog)
    return <Close className="cursor-pointer position-absolute end-0 me-3" onClick={() => setDialog(null)} style={{ top: '1em' }} />
}

export default function Dialog() {
    const Dialog = useUIStore(s => s.dialog)
    const setDialog = useUIStore(s => s.setDialog)

    const handleSubmit = () => {
        Dialog?.onConfirm()
        setDialog(null)
    }

    return <Modal show={!!Dialog} className="mt-3">
        {
            Dialog && (<>
                <Dialog.Content />
                <Container className="d-flex justify-content-end px-5 pb-4">
                    <Button variant="outline-light" style={{ opacity: 0.9 }} className="rounded-0" onClick={() => setDialog(null)}>
                        {
                            Dialog.cancelLabel || "Cancel"
                        }
                    </Button>
                    {
                        Dialog.submitLabel &&
                        <Button variant="outline-info" className="btn-submit ms-4" onClick={handleSubmit}>{Dialog.submitLabel}</Button>
                    }
                </Container>
            </>
            )
        }
    </Modal>
}
