import shared from "../shared"
import User from "../users/model"

export default async function messageStatus(msg: OutgoingMessageWithSender | ReceivedMessage, status: OutgoingMessageStatus) {
    const statusUpdate: MessageStatusUpdate = {
        chatId: msg.chatId,
        hash: msg.hash,
        recipientId: msg.for,
        status,
        timestamp: Date.now()
    }
    const { socket } = shared.onlineUsers[msg.sender._id.toString()] || {}

    if (!(socket &&
        await new Promise((resolve) => {
            // console.log(`Emitting message status update [${statusUpdate.status}] to sender (${msg.sender.nick})`)
            const timeout = setTimeout(() => {
                // console.log(`${msg.sender.nick}'s socket timed out...`)
                resolve(false)
            }, 3000)

            socket.emit('msg-status', statusUpdate, () => {
                // console.log(`${msg.hash} status update ackd: ${statusUpdate.status}`)
                clearTimeout(timeout)
                resolve(true)
            })
        }))) {
        // console.log("pushing to queue STATUS ", msg.hash, statusUpdate.status);
        const sender = await User.findById(msg.sender._id);
        await sender?.updateOne({
            $push: {
                "queues.status": statusUpdate
            }
        })
    }
}
