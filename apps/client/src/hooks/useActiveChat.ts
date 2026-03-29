import { useAuthStore } from "stores/auth";
import { useChatsStore } from "stores/chats";
import { useParams } from "react-router-dom";

export default function useActiveChat() {
    const chats = useChatsStore(state => state.chats)
    const user = useAuthStore(state => state.user)
    const { activeChatId } = useParams()

    const recipients = !!activeChatId && !!chats?.[activeChatId] && chats[activeChatId].members?.filter(m => m._id !== user?._id)

    return {
        recipients,
        activeChatId,
        activeChat: recipients && chats[activeChatId],
    }
}