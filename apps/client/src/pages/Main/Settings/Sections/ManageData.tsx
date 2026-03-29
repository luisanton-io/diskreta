import API from "API";
import { dialogState } from "atoms/dialog";
import { AxiosError } from "axios";
import { CHATS, USER, USER_DIGEST } from "constants/localStorage";
import copy from "copy-to-clipboard";
import { useRef } from "react";
import { Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { Download, Trash, Upload } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import Section from ".";

const STORAGE_KEYS = [CHATS, USER, USER_DIGEST]

export default function ManageData() {

    const navigate = useNavigate()
    const setDialog = useSetRecoilState(dialogState)

    const handleRemoveData = async () => {
        if (!window.confirm("You are about to remove ALL your account data. You will NEVER be able to recover your data. Are you sure to continue?")) {
            return
        }

        try {
            await API.delete("/users/me")
            localStorage.clear()
            navigate("/register")
        } catch (error) {
            toast.error(error instanceof AxiosError ? error.response?.data?.error : (error as Error).message)
        }
    }

    const importedDataRef = useRef('')

    const handleImportData = () => {
        setDialog({
            Content: function () {
                return <div className="p-3">
                    <h5>Import data</h5>
                    <p className="text-muted">Paste your data here and press "Import"</p>
                    <textarea className="form-control rounded-0" rows={10} onChange={e => { importedDataRef.current = e.target.value }} />
                </div>
            },
            onConfirm: () => {
                try {
                    const data = JSON.parse(importedDataRef.current);
                    STORAGE_KEYS
                        .map(key => {
                            if (!data[key]) {
                                throw new Error(`Missing key "${key}"`)
                            }
                            return key
                        }).forEach(key => {
                            localStorage.setItem(key, data[key])
                        })
                } catch (error) {
                    toast.error("Corrupted data. Please try exporting again.")
                } finally {
                    window.location.reload()
                }
            },
            submitLabel: "Import"
        })
    }

    const handleExportData = () => {
        STORAGE_KEYS.forEach((key, i) => {
            if (!localStorage.getItem(key)) {
                throw new Error(`Missing key "${Object.keys(STORAGE_KEYS)[i]}"`)
            }
        })
        const data: Record<string, string> = {}
        STORAGE_KEYS.forEach(key => {
            data[key] = localStorage.getItem(key) as string
        })

        copy(JSON.stringify(data))

        alert("Data copied to clipboard. This data is military grade encrypted and can only be decrypted using Diskreta in another device, using your recovery phrase to regenerate your keys.")
    }

    //     return <Dropdown.Menu style={{ backdropFilter: "blur(8px)", backgroundColor: 'rgba(16,16,16,0.50)' }}>
    //     <Dropdown.Header>Data</Dropdown.Header>
    //     <Dropdown.Item className="bg-transparent text-white" onClick={handleImportData}>
    //         Import
    //     </Dropdown.Item>
    //     <Dropdown.Item className="bg-transparent text-white" onClick={handleExportData}>
    //         Export
    //     </Dropdown.Item>
    //     <Dropdown.Divider />
    //     <Dropdown.Item className="bg-transparent text-white" onClick={handleRemoveData}>Delete</Dropdown.Item>
    // </Dropdown.Menu>
    // </Dropdown>

    return <Section title="Manage Data">
        <ListGroup className="bg-transparent text-white">
            <ListGroupItem className="cursor-pointer bg-transparent text-white border d-flex align-items-center rounded-0 mb-2" onClick={handleImportData}>
                <Download /><span className="ms-2">Import</span>
            </ListGroupItem>
            <ListGroupItem className="cursor-pointer bg-transparent text-white border d-flex align-items-center rounded-0 mb-2" onClick={handleExportData}>
                <Upload /><span className="ms-2">Export</span>
            </ListGroupItem>
            <Button variant="outline-danger" className="d-flex align-items-center rounded-0 mb-2 px-3 py-2" onClick={handleRemoveData}>
                <Trash /><span className="ms-2">Delete</span>
            </Button>
        </ListGroup>
    </Section>
}