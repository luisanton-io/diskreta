import { dialogState } from "atoms/dialog";
import { Button } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { useSetRecoilState } from "recoil";
import SearchDialog from "./SearchDialog";
import Settings from "../Settings";


export default function SideHeader() {

    const setDialog = useSetRecoilState(dialogState)

    const handleShowSearchDialog = () => {
        setDialog({
            Content: SearchDialog,
            onConfirm: () => setDialog(null),
            cancelLabel: "Close"
        })
    }

    return <div className="d-flex align-items-center">
        <Button variant="outline-info"
            className="btn-submit flex-grow-1 d-flex align-items-center justify-content-center py-2"
            onClick={handleShowSearchDialog}>
            <Plus className="me-1" style={{ fontSize: '1.5em' }} />
            <span>New</span>
        </Button>
        <Settings />
    </div>
}