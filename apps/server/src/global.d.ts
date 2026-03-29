interface User {
    _id: string
    nick: string
    publicKey: string
    digest?: string,
    refreshToken: string,
    queues: Queues
}
interface Queues {
    messages: Message[],
    status: MessageStatusUpdate[]
}
interface JWTPayload {
    _id: string
}

namespace Express {
    interface Request {
        user?: string
    }
}

// Shared with Frontend:

interface LoginResponse {
    token: string
    user: User
}

interface Media {
    type: 'image' | 'video' | 'audio' | 'file'
    data: string
    encryptionKey: string  // AES-256
}

interface Message {
    sender: User
    to: User[] // all recipients list
    for: User["_id"] // id of user whose public key was used to encrypt the message
    chatId: string // calc as sha256([sender, ...to].sort().join())
    content: {
        text: string;
        media?: Media
    }
    timestamp: number,
    hash: string
    replyingTo?: Message
}

interface ReceivedMessage extends Message {
    status: ReceivedMessageStatus
}
interface OutgoingMessage extends Omit<Message, "sender"> {
    for: string
    // sender?: Message["sender"]
}

interface OutgoingMessageWithSender extends Omit<OutgoingMessage, "sender"> {
    sender: Message["sender"]
}
interface SentMessage extends Message {
    status: Record<User["_id"], SentMessageStatus>
}

interface Chat {
    messages: Message[];
    members: User[]
}

type OutgoingMessageStatus = 'outgoing' | 'sent' | 'delivered' | 'read' | 'error'

type ReceivedMessageStatus = 'new' | 'read'

interface MessageStatusUpdate {
    chatId: string,
    hash: string,
    recipientId: string,
    status: OutgoingMessageStatus,
    timestamp: number
}

interface MessageAck {
    error?: string
    hash?: string
}

interface ReactionPayload {
    chatId: string,
    hash: string,
    senderId: string, // user id
    recipientId: string, // user id
    reaction: string
}