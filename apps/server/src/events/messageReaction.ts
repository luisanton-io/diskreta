import shared from "../shared"
import User from "../users/model"

const messageReaction = async ({ chatId, hash, senderId, recipientId, reaction }: ReactionPayload) => {
    // console.log("reaction", reaction)
    const incomingReaction = { chatId, hash, senderId, reaction }
    // send reaction to recipient
    const recipientSocket = shared.onlineUsers[recipientId]?.socket
    if (!(recipientSocket &&
        await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false)
            }, 3000)

            recipientSocket.emit("in-reaction", incomingReaction, () => {
                clearTimeout(timeout)
                console.log("Emitted reaction to", recipientId)
                resolve(true)
            })
        }))) {

        await User.updateOne({
            _id: recipientId,
        }, {
            $push: {
                "queues.reactions": incomingReaction
            }
        })
    }
}

export default messageReaction