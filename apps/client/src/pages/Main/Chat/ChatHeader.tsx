import { useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { ArrowLeftShort, ThreeDots } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import useHandleDeleteChat from "../handlers/useHandleDeleteChat";
import { ChatContext } from "./context/ChatCtx";

export default function ChatHeader() {
    const handleDeleteChat = useHandleDeleteChat();
    const { activeChat, recipients } = useContext(ChatContext)

    return <div className="d-flex align-items-center mt-3">
        <Link to="/" className="d-md-none text-white me-2"><ArrowLeftShort style={{ fontSize: '2em' }} /></Link>
        {recipients && <h4 className="m-0" style={{ letterSpacing: .5 }}>
            {recipients.map(r => r.nick).join(", ")}
        </h4>}

        <Dropdown className="ms-auto">
            <Dropdown.Toggle variant="link" className="rounded-0 text-white border-0 shadow-none">
                <ThreeDots style={{ fontSize: '1.5em' }} />
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ backdropFilter: "blur(8px)", backgroundColor: 'rgba(16,16,16,0.50)' }}>
                <Dropdown.Item className="bg-transparent text-white">
                    Block/Report [coming soon]
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="bg-transparent text-white" onClick={() => handleDeleteChat(activeChat.id)}>Delete Chat</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </div>
}