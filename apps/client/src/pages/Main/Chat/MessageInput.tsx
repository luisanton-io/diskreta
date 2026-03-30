import { refreshToken } from "API/refreshToken";
import { Button } from "@/components/ui/button";
import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder";
import { AES, SHA256 } from "crypto-js";
import { pki, random, util } from "node-forge";
import { useContext, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "stores/auth";
import { useChatsStore } from "stores/chats";
import { useUIStore } from "stores/ui";
import { Socket } from "socket.io-client";
import maskUser from "util/maskUser";
import useMessageStatus from "../handlers/useMessageStatus";
import { ChatContext } from "./context/ChatCtx";
import { SpotlightProps } from "./Spotlight";

export default function MessageInput() {
  const user = useAuthStore((s) => s.user);

  const handleMessageStatus = useMessageStatus();

  const { socket, connected, recipients, activeChat, setSpotlight } =
    useContext(ChatContext);
  const socketRef = useRef<Socket>(socket);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const [text, setText] = useState("");

  const replyingTo = useUIStore((s) => s.replyingTo);
  const setReplyingTo = useUIStore((s) => s.setReplyingTo);

  useEffect(() => {
    setReplyingTo(undefined);
  }, [activeChat.id, setReplyingTo]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; // ~5 lines max
  };

  const handleSendMessage = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();

    if (!socketRef.current?.connected)
      try {
        await refreshToken();
      } catch {
        return toast.error("Cannot connect. Try again later.");
      }

    if (!text) return;

    const payload: Omit<SentMessage, "hash" | "status"> = {
      sender: maskUser(user)!,
      to: recipients,
      chatId: activeChat.id,
      content: { text },
      timestamp: Date.now(),
      replyingTo,
    };

    const message = {
      ...payload,
      hash: SHA256(JSON.stringify(payload)).toString(),
    };

    const sentMessage: SentMessage = {
      ...message,
      content: {
        text: message.content.text,
      },
      status: recipients.reduce(
        (all, { _id }) => ({
          ...all,
          [_id]: "outgoing",
        }),
        {}
      ),
    };

    const currentChats = useChatsStore.getState().chats;
    useChatsStore.getState().setChats({
      ...currentChats,
      [activeChat.id]: {
        ...activeChat,
        messages: [...activeChat.messages, sentMessage],
        indexing: {
          ...(activeChat.indexing || {}),
          [sentMessage.hash]: activeChat.messages.length,
        },
      },
    });

    for (const recipient of recipients) {
      const publicKey = pki.publicKeyFromPem(recipient.publicKey);

      const outgoingMessage: OutgoingMessage = {
        ...message,
        to: recipients,
        for: recipient._id,
        content: {
          text:
            text &&
            util.encode64(publicKey.encrypt(util.encodeUtf8(text))),
        },
        replyingTo: replyingTo && {
          ...replyingTo,
          content: {
            text: util.encode64(
              publicKey.encrypt(
                util.encodeUtf8(replyingTo.content.text || "📷")
              )
            ),
          },
        },
      };

      delete outgoingMessage.sender;

      (async () => {
        try {
          let sent = false;
          do {
            sent = await new Promise((resolve) => {
              socketRef.current?.emit(
                "out-msg",
                outgoingMessage,
                (recipientId: string) => {
                  if (!recipientId)
                    return setTimeout(() => {
                      resolve(false);
                    }, 1000);

                  handleMessageStatus({
                    chatId: activeChat.id,
                    hash: message.hash,
                    recipientId,
                    status: "sent",
                  });
                  resolve(true);
                }
              );

              setTimeout(() => {
                resolve(false);
              }, 3000);
            });
          } while (!sent);
        } catch (error) {
          console.log(error);
        }
      })();
    }

    setText("");
    resetTextareaHeight();
    setReplyingTo(undefined);
    setSpotlight({} as SpotlightProps);
  };

  // Typing indicator logic
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(!!text);

    const timeout =
      !!text &&
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [text]);

  useEffect(() => {
    const interval =
      isTyping &&
      setInterval(() => {
        for (const recipient of recipients) {
          socket.emit("typing", {
            chatId: activeChat.id,
            recipient,
            sender: maskUser(user)!,
          });
        }
      }, 400);

    return () => {
      interval && clearInterval(interval);
    };
  }, [isTyping, recipients, socket, activeChat.id, user]);

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-end gap-2 border-t border-border p-3"
    >
      <textarea
        ref={textareaRef}
        autoComplete="off"
        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Type a message..."
        rows={1}
        value={text}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSendMessage(e);
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text || !connected}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
