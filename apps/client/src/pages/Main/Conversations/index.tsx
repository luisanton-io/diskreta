import { chatsState } from "atoms/chats";
import { userState } from "atoms/user";
import useActiveChat from "hooks/useActiveChat";
import React from "react";
import { Button, ListGroup } from "react-bootstrap";
import { Arrow90degUp, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import useHandleDeleteChat from "../handlers/useHandleDeleteChat";

export default function Conversations() {

    const navigate = useNavigate()

    const chats = useRecoilValue(chatsState)
    const user = useRecoilValue(userState)
    const { activeChatId } = useActiveChat()

    const handleDeleteChat = useHandleDeleteChat()
    const latestTimestamp = (chat: Chat) => chat.messages[chat.messages.length - 1]?.timestamp || Date.now()

    const newMessages = (chat: Chat) => chat.messages.filter(message =>
        message.sender._id !== user!._id && (message as ReceivedMessage).status === 'new'
    )?.length

    return <ListGroup id="conversations">
        {
            chats && Object.values(chats)
                .sort((a, b) => latestTimestamp(b) - latestTimestamp(a))
                .map(chat => {
                    const recipients = chat.members.filter(m => m._id !== user?._id)
                    const recipientsNicks = chat.members.filter(m => m._id !== user?._id).map(r => r.nick).join(', ')
                    const latestMessage = chat.messages[chat.messages.length - 1]

                    return <React.Fragment key={chat.id}>
                        <ListGroup.Item
                            className="conversation"
                            style={{ minHeight: 90 }}
                            onClick={() => navigate(`/${chat.id}`)}
                            data-active={chat.id === activeChatId}
                            data-unread={newMessages(chat) || undefined}
                        >
                            <h6 className="fw-bold">{recipientsNicks}</h6>
                            {
                                !!chat.typing?.length
                                    ?
                                    <div
                                        className="d-flex align-items-center"
                                        style={{ width: "95%" }}
                                    >
                                        <p className="m-0 text-light" style={{ whiteSpace: "nowrap", textOverflow: 'ellipsis', overflow: "hidden" }}>
                                            {recipients.filter(r => chat.typing?.includes(r._id)).map(r => r.nick).join(', ')} is typing...
                                        </p>
                                    </div>
                                    : latestMessage && (
                                        <div
                                            className="d-flex align-items-center"
                                            style={{ width: "95%" }}
                                        >
                                            {latestMessage.sender._id === user!._id && <Arrow90degUp className="me-2" style={{ transform: "scale(1.2)" }} />}
                                            <p className="m-0 text-light" style={{ whiteSpace: "nowrap", textOverflow: 'ellipsis', overflow: "hidden" }}>
                                                {latestMessage.content.text}
                                            </p>
                                        </div>
                                    )
                            }
                            <Button variant="outline-danger"
                                onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteChat(chat.id)
                                }}
                                className="delete-btn position-absolute rounded-0 d-none d-md-block"
                                style={{ inset: 'auto 1em auto auto' }}>
                                <Trash3 />
                            </Button>
                        </ListGroup.Item>
                        <hr />
                    </React.Fragment>
                })
        }
    </ListGroup>
}