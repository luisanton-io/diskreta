import { dialogState } from "atoms/dialog";
import { DialogClose } from "components/Dialog";
import { GearWideConnected } from "react-bootstrap-icons";
import { useSetRecoilState } from "recoil";
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
    const setDialog = useSetRecoilState(dialogState)

    const openDialog = () => {
        setDialog({
            Content: SettingsDialogContent,
            onConfirm: () => setDialog(null)
        })
    }
    return (
        <GearWideConnected
            onClick={openDialog}
            className="cursor-pointer"
            style={{ fontSize: '1.7em', marginInline: '1ch' }}
        />
    )
}