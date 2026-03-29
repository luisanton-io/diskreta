export const isMessageSent = (message: SentMessage | ReceivedMessage): message is SentMessage => typeof message.status !== 'string'
