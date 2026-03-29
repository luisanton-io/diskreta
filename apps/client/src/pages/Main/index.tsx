import { refreshToken } from "API/refreshToken";
import { ScrollArea } from "@/components/ui/scroll-area";
import { USER_DIGEST } from "constants/localStorage";
import useActiveChat from "hooks/useActiveChat";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "stores/auth";
import { useUIStore } from "stores/ui";
import { isTokenExpired } from "util/isTokenExpired";
import Chat from "./Chat";
import Conversations from "./Conversations";
import SideHeader from "./SideHeader";

export default function Main() {

    const navigate = useNavigate()

    const user = useAuthStore(s => s.user)
    const hasFocus = useUIStore(s => s.focus)

    const { activeChatId } = useActiveChat()
    const { token } = user || {}

    const userExists = !!user

    useEffect(() => {
        if (!userExists) {
            !localStorage.getItem(USER_DIGEST)
                ? navigate("/register")
                : navigate("/login")
        }
    }, [userExists, navigate])

    useEffect(() => {
        hasFocus && !!token && isTokenExpired(token) && refreshToken()
    }, [hasFocus, token])

    const hasActiveChat = !!activeChatId

    return <div className="flex h-full">
        {/* Sidebar */}
        <div
            id="main-left"
            className={`flex flex-col h-full w-full md:w-80 md:min-w-80 md:border-r md:border-white/10 ${hasActiveChat ? "hidden md:flex" : "flex"}`}
        >
            <SideHeader />
            <ScrollArea className="flex-1">
                <Conversations />
            </ScrollArea>
        </div>

        {/* Main panel */}
        <div
            id="main-right"
            className={`flex flex-col flex-1 relative h-full ${hasActiveChat ? "flex" : "hidden md:flex"}`}
        >
            {hasActiveChat ? (
                <Chat />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                    <MessageSquare className="h-12 w-12 opacity-40" />
                    <p className="text-sm">Select a conversation</p>
                </div>
            )}
        </div>
    </div>
}
