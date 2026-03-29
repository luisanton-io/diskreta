import { useChatsStore } from "stores/chats"
import { useNavigate } from "react-router-dom"

export default function useHandleDeleteChat() {
    const deleteChat = useChatsStore(state => state.deleteChat)
    const navigate = useNavigate()

    return (id: string) => {
        if (window.confirm("Are you sure you want to delete this chat?")) {
            deleteChat(id)
            navigate("/")
        }
    }
}