import { refreshToken } from "API/refreshToken";
import { Button } from "@/components/ui/button";
import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder";
import { AES, SHA256 } from "crypto-js";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { pki, random, util } from "node-forge";
import { useContext, useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "stores/auth";
import { useChatsStore } from "stores/chats";
import { useUIStore } from "stores/ui";
import { Socket } from "socket.io-client";
import convertFileToBase64 from "util/convertFileToBase64";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<Media | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setMediaLoading(true);

      const selectedFile = await (async () => {
        if (!file.name.toLowerCase().endsWith("heic")) return file;
        const pngBlob = (await heic2any({
          blob: new Blob([file], { type: file.type }),
          toType: "image/png",
        })) as Blob;
        return new File([pngBlob], "image.png", { type: pngBlob.type });
      })();

      const compressedFile = await imageCompression(selectedFile, {
        maxWidthOrHeight: 1000,
        maxSizeMB: 0.8,
        useWebWorker: true,
      });

      const mediaObj: Media = {
        type: "image",
        data: await convertFileToBase64(compressedFile),
        encryptionKey: util.bytesToHex(random.getBytesSync(32)),
      };

      setMedia(mediaObj);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setMediaLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

    if (!text && !media) return;

    const payload: Omit<SentMessage, "hash" | "status"> = {
      sender: maskUser(user)!,
      to: recipients,
      chatId: activeChat.id,
      content: { text, media: media || undefined },
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
        media: media
          ? { ...media, data: MEDIA_PLACEHOLDER }
          : undefined,
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

      const encryptedMedia = media
        ? {
            ...media,
            encryptionKey: util.encode64(
              publicKey.encrypt(util.encodeUtf8(media.encryptionKey))
            ),
            data: AES.encrypt(media.data, media.encryptionKey).toString(),
          }
        : undefined;

      const outgoingMessage: OutgoingMessage = {
        ...message,
        to: recipients,
        for: recipient._id,
        content: {
          text:
            text &&
            util.encode64(publicKey.encrypt(util.encodeUtf8(text))),
          media: encryptedMedia,
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
    setMedia(null);
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
      className="border-t border-border"
    >
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="flex-1 rounded-lg border-l-4 border-primary bg-muted px-3 py-2">
            <p className="m-0 text-xs font-semibold text-foreground">
              {replyingTo.sender._id === user?._id ? "You" : replyingTo.sender.nick}
            </p>
            <p className="m-0 truncate text-xs text-muted-foreground">
              {replyingTo.content.text || "📷 Photo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(undefined)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {media && (
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="relative">
            <img
              src={media.data}
              alt="Preview"
              className="h-20 w-20 rounded-md object-cover"
            />
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={mediaLoading}
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
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
          disabled={(!text && !media) || !connected}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
