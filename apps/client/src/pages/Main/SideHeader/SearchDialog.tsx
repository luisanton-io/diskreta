import API from "API";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AxiosError } from "axios";
import { Loader2, MessageSquarePlus, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "stores/auth";
import { useChatsStore } from "stores/chats";
import createChatId from "util/createChatId";
import maskUser from "util/maskUser";

export default function SearchDialog() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const timeout = useRef<NodeJS.Timeout>();

    const user = useAuthStore((s) => s.user);
    const chats = useChatsStore((s) => s.chats);
    const setChats = useChatsStore((s) => s.setChats);

    useEffect(() => {
        timeout.current && clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
    }, [query]);

    useEffect(() => {
        if (!query) {
            setUsers([]);
            setLoading(false);
            setError("");
            return;
        }

        if (query !== debouncedQuery) return;

        const getUsers = async () => {
            setLoading(true);
            setUsers([]);
            setError("");
            try {
                const { data } = await API.get<User[]>(`/users?nick=${query}`);
                setUsers(data);
            } catch (err) {
                const msg =
                    err instanceof AxiosError
                        ? err.response?.data?.error
                        : (err as Error).message;
                setError(msg || "Failed to search users");
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, [debouncedQuery, query]);

    const handleSelectedUser = (selectedUser: User) => {
        const chatId = createChatId(user!._id, selectedUser._id);
        const exists = !!chats?.[chatId];

        if (!exists) {
            const publicUser = maskUser(user);
            const currentChats = useChatsStore.getState().chats;

            setChats({
                ...currentChats,
                [chatId]: {
                    id: chatId,
                    messages: [],
                    members: [publicUser!, selectedUser],
                    indexing: {},
                },
            });
        }

        navigate("/" + chatId);
        setOpen(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setQuery("");
            setDebouncedQuery("");
            setUsers([]);
            setError("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="New chat">
                    <MessageSquarePlus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search users</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Nickname..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                        autoFocus
                    />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="max-h-64 overflow-y-auto">
                    {users.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {users.map((u) => (
                                <button
                                    key={u._id}
                                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors cursor-pointer"
                                    onClick={() => handleSelectedUser(u)}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {u.nick.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{u.nick}</span>
                                </button>
                            ))}
                        </div>
                    ) : query && !loading && !error ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            <Users className="h-8 w-8 opacity-40" />
                            <p className="text-sm">No users found</p>
                        </div>
                    ) : !query ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            <Search className="h-8 w-8 opacity-40" />
                            <p className="text-sm">Search by nickname to start a chat</p>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
