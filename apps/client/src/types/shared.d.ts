interface LoginResponse {
    user: User
    token: string
    refreshToken: string
}

type RefreshResponse = Omit<LoginResponse, "user">

interface User {
    _id: string
    nick: string
    publicKey: string
}

type SentMessageStatusWithoutTime = 'outgoing' | 'sent' | 'delivered' | 'read' | 'error'
type SentMessageStatus = `${SentMessageStatusWithoutTime} ${number}`

type ReceivedMessageStatus = 'new' | 'read'

interface MessageStatusUpdate {
    chatId: string,
    hash: string,
    recipientId: string,
    status: SentMessageStatusWithoutTime | ReceivedMessageStatus
    timestamp?: number
}

interface Media {
    type: 'image' | 'video' | 'audio' | 'file'
    data: string
    encryptionKey: string  // AES-256
}
interface Message {
    sender: User
    to: User[]
    chatId: string
    content: {
        text: string;
        media?: Media
    }
    timestamp: number
    hash: string,
    replyingTo?: Reply
    reactions?: Record<string, Reaction | undefined>
}

type Reply = Pick<Message, 'sender' | 'content' | 'hash'>
interface ReceivedMessage extends Message {
    status: ReceivedMessageStatus
}
interface OutgoingMessage extends Omit<Message, "sender"> {
    for: string
    sender?: Message["sender"]
}
interface SentMessage extends Message {
    status: Record<User["_id"], SentMessageStatus>
}
interface Chat {
    id: string
    messages: (SentMessage | ReceivedMessage)[];
    members: User[]
    typing?: User["_id"][]
    indexing: Record<string, number> // msg hash -> msg index
}
interface Queue {
    messages: ReceivedMessage[],
    status: MessageStatusUpdate[],
    reactions: IncomingReaction[]
}

interface TypingMsg {
    chatId: string
    sender: User
}

type Override<T, R> = Omit<T, keyof R> & R;

interface ReactionPayload {
    chatId: string,
    hash: string,
    senderId: string, // user id
    recipientId: string, // user id
    reaction: Reaction
}

type IncomingReaction = Omit<ReactionPayload, "recipientId">