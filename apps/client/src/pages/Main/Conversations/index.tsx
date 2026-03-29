import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import useActiveChat from "hooks/useActiveChat"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "stores/auth"
import { useChatsStore } from "stores/chats"

export default function Conversations() {
    const navigate = useNavigate()
    const chats = useChatsStore(s => s.chats)
    const user = useAuthStore(s => s.user)
    const deleteChat = useChatsStore(s => s.deleteChat)
    const { activeChatId } = useActiveChat()
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const latestTimestamp = (chat: Chat) =>
        chat.messages[chat.messages.length - 1]?.timestamp || 0

    const unreadCount = (chat: Chat) =>
        chat.messages.filter(
            m => m.sender._id !== user!._id && (m as ReceivedMessage).status === "new"
        ).length

    const formatTime = (timestamp: number) => {
        if (!timestamp) return ""
        const date = new Date(timestamp)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = date.toDateString() === yesterday.toDateString()

        if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        if (isYesterday) return "Yesterday"
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    const getInitials = (nick: string) =>
        nick.slice(0, 2).toUpperCase()

    const handleDelete = () => {
        if (deleteTarget) {
            deleteChat(deleteTarget)
            if (activeChatId === deleteTarget) navigate("/")
            setDeleteTarget(null)
        }
    }

    const sorted = chats
        ? Object.values(chats).sort((a, b) => latestTimestamp(b) - latestTimestamp(a))
        : []

    return (
        <>
            <div className="flex flex-col">
                {sorted.map(chat => {
                    const recipients = chat.members.filter(m => m._id !== user?._id)
                    const recipientsNicks = recipients.map(r => r.nick).join(", ")
                    const latestMessage = chat.messages[chat.messages.length - 1]
                    const isActive = chat.id === activeChatId
                    const unread = unreadCount(chat)
                    const isTyping = !!chat.typing?.length
                    const typingNicks = isTyping
                        ? recipients.filter(r => chat.typing?.includes(r._id)).map(r => r.nick).join(", ")
                        : ""

                    return (
                        <div
                            key={chat.id}
                            className={`group relative flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                                isActive ? "bg-accent" : ""
                            }`}
                            onClick={() => navigate(`/${chat.id}`)}
                        >
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                    {getInitials(recipients[0]?.nick || "?")}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-sm truncate">
                                        {recipientsNicks}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                        {formatTime(latestTimestamp(chat))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                    <p className="text-xs text-muted-foreground truncate m-0">
                                        {isTyping ? (
                                            <span className="text-primary italic">{typingNicks} is typing...</span>
                                        ) : latestMessage ? (
                                            <>
                                                {latestMessage.sender._id === user!._id && (
                                                    <span className="text-muted-foreground/70">You: </span>
                                                )}
                                                {latestMessage.content.text || (latestMessage.content.media ? "📷 Photo" : "")}
                                            </>
                                        ) : null}
                                    </p>
                                    {unread > 0 && (
                                        <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold shrink-0">
                                            {unread}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Delete button - hover on desktop */}
                            <button
                                className="hidden md:group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={e => {
                                    e.stopPropagation()
                                    setDeleteTarget(chat.id)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )
                })}
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this conversation and all its messages. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
