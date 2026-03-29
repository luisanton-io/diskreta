import { userState } from "atoms/user"
import { DialogClose } from "components/Dialog"
import { useRecoilValue } from "recoil"
import { reactions } from "./Message"

interface Props {
    message: Message,
    recipients: User[]
}

export default function UsersReaction({ message, recipients }: Props) {

    const user = useRecoilValue(userState)

    return <div id="users-reaction">
        <h5 className="mt-4 text-start">Reactions</h5>
        <DialogClose />
        {
            Object.entries(message.reactions || {})
                .sort(([, aReaction], [, bReaction]) => {
                    return reactions.indexOf(aReaction!) - reactions.indexOf(bReaction!)
                })
                .map(([memberId, reaction]) => {
                    const nick = (recipients as User[]).find(r => r._id === memberId)?.nick || user?.nick
                    return <div key={memberId} className="d-flex w-100 align-items-center p-3">
                        <span className="w-25 text-center fs-2">{reaction}</span>
                        <span>{nick}</span>
                    </div>
                })
        }</div>
}