import { chatsState } from "atoms/chats";
import { userState } from "atoms/user";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

export default function useActiveChat() {
    const chats = useRecoilValue(chatsState)
    const user = useRecoilValue(userState)
    const { activeChatId } = useParams()

    const recipients = !!activeChatId && !!chats?.[activeChatId] && chats[activeChatId].members?.filter(m => m._id !== user?._id)

    return {
        recipients,
        activeChatId,
        activeChat: recipients && chats[activeChatId],
    }
}