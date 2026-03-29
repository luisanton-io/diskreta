import { Socket } from "socket.io";

interface OnlineUserData {
    socket: Socket
}
interface Shared {
    onlineUsers: Record<User["_id"], OnlineUserData>,
}

export const makeEmptyQueues: () => Queues = () => ({
    messages: [],
    status: []
})

const shared: Shared = {
    onlineUsers: {}
};

export default shared