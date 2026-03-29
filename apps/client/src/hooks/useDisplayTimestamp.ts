import { timestampState as timestampAtom } from "atoms/timestamp";
import { useRecoilState } from "recoil";
import { isMessageSent } from "util/isMessageSent";

export default function useDisplayTimestamp(message: SentMessage | ReceivedMessage, index: number) {

    const [timestampState, setTimestampState] = useRecoilState(timestampAtom)

    if (!isMessageSent(message)) return ({
        handleDisplayTimeStamp: () => { },
        show: false,
        displayedTimestamp: ''
    })

    const handleDisplayTimeStamp = () => {
        if (timestampState?.timeout) clearTimeout(timestampState.timeout)

        setTimestampState({
            timeout: setTimeout(() => {
                setTimestampState(null)
            }, 4000),
            index
        })
    }

    const [status, timestamp] = message.status?.[Object.keys(message.status)[0]].split(' ')
    const time = new Date(parseInt(timestamp))

    const statusUpdateDay = new Date(parseInt(timestamp)).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    const yesterday = today - 86400000

    // console.table({ messageDay: statusUpdateDay, today, yesterday })

    const displayedTimestamp = status.charAt(0).toUpperCase() + status.slice(1) + ': ' + (
        !!timestamp
            ? (
                statusUpdateDay === today
                    ? 'today, ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : statusUpdateDay === yesterday
                        ? 'yesterday, ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : time.toLocaleDateString([], {
                            weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
            )
            : ''
    )

    const show = timestampState?.index === index

    return { handleDisplayTimeStamp, show, displayedTimestamp }


}