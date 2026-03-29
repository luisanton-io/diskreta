import { Badge } from "react-bootstrap"

interface Props {
    timestamp: number
}
export default function FloatingDate({ timestamp }: Props) {

    const dateString = (() => {
        const messageDate = new Date(timestamp).setHours(0, 0, 0, 0)
        const today = new Date().setHours(0, 0, 0, 0)
        const yesterday = today - 86400000

        switch (true) {
            case messageDate === yesterday:
                return "Yesterday"
            case messageDate === today:
                return "Today"
            default:
                return new Date(timestamp).toLocaleString('default', { day: '2-digit', month: 'long', year: 'numeric' })
        }
    })()

    return <Badge className="mx-auto my-4 px-4 py-2 rounded-pill border bg-transparent text-white">
        {dateString}
    </Badge>
}