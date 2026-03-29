import { Reply } from '@mui/icons-material';
import outgoing from '@mui/icons-material/AccessTime';
import sent from '@mui/icons-material/Done';
import delivered from '@mui/icons-material/DoneAll';
import { dialogState } from 'atoms/dialog';
import { replyingToState } from 'atoms/replyingTo';
import { userState } from 'atoms/user';
import { MEDIA_PLACEHOLDER } from 'constants/mediaPlaceholder';
import useDisplayTimestamp from "hooks/useDisplayTimestamp";
import useLongPress from 'hooks/useLongPress';
import useSwipe from 'hooks/useSwipe';
import useUpdateMessage from 'hooks/useUpdateMessage';
import React, { CSSProperties, useContext, useEffect } from 'react';
import { EmojiSmile } from 'react-bootstrap-icons';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isMessageSent } from 'util/isMessageSent';
import UsersReaction from './UsersReaction';
import { ChatContext } from './context/ChatCtx';
import { isMobile } from 'react-device-detect';

const Icons = {
    outgoing, sent, delivered, read: delivered, error: () => null, new: () => null
}

interface Props {
    message: SentMessage | ReceivedMessage;
    sent: boolean
    i: number
}

const urlRegexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
const emojiRegex = new RegExp(/^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){1,2}|(?:\ud83d[\udc00-\ude4f]){1,2}|(?:\ud83d[\ude80-\udeff]){1,2}|(?:\ud83e[\udd00-\udfff]){1,2}|[\u0023-\u0039]\u20e3|[\u200d\u2934-\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299]\ufe0f?)+$/);

export const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const

export default function Message({ message, sent, i }: Props) {

    const id = '_' + message.hash
    const messageTime = `${new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const { handleDisplayTimeStamp, displayedTimestamp, show } = useDisplayTimestamp(message, i)

    const status = isMessageSent(message) ? message.status?.[message.to[0]._id].split(' ')[0] : message.status
    const Icon = Icons[status as SentMessageStatusWithoutTime | ReceivedMessageStatus]

    const { socket, recipients, setSpotlight, handleScrollTo } = useContext(ChatContext)

    const { deltaX, vSwipe, ...swipeHandlers } = useSwipe()

    const triggerReply = !vSwipe && deltaX > 50

    const translateX = triggerReply ? 50 : vSwipe ? 0 : deltaX
    const transform = !!translateX ? `translateX(-${translateX}px)` : undefined

    // console.table({ deltaX, translateX, transform })

    const setReplyingTo = useSetRecoilState(replyingToState)

    useEffect(() => {
        if (triggerReply) {
            navigator.vibrate?.(80)
            setReplyingTo({
                sender: message.sender,
                hash: message.hash,
                content: message.content
            })
        }
    }, [triggerReply, setReplyingTo, message])

    const replyIconTransition = Math.abs(deltaX) / 50

    const { longPressTimeout, longPressed, setLongPressed, ...longPressHandlers } = useLongPress()

    useEffect(() => {
        const currentTimeout = longPressTimeout.current
        return () => {
            currentTimeout && clearTimeout(currentTimeout)
        }
    }, [deltaX, longPressTimeout])

    useEffect(() => {
        longPressed && document.querySelector(`#${id}`)!.scrollIntoView({ behavior: 'smooth', "block": "center" })
    }, [longPressed, id])

    const user = useRecoilValue(userState)
    const updateMessage = useUpdateMessage()

    const handleReaction = (reaction: Reaction) => () => {
        updateMessage({
            chatId: message.chatId,
            hash: message.hash,
            updater: message => ({
                ...message,
                reactions: {
                    ...(message.reactions || {}),
                    [user!._id]: message.reactions?.[user!._id] === reaction ? undefined : reaction
                }
            })
        })
        for (const recipient of recipients) {
            const reactionPayload: ReactionPayload = {
                chatId: message.chatId,
                hash: message.hash,
                senderId: user!._id,
                recipientId: recipient._id,
                reaction
            }

            socket.emit('out-reaction', reactionPayload)
        }
    }

    const setDialog = useSetRecoilState(dialogState)

    const handleReactionsDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // open dialog to display users reactions
        e.stopPropagation()
        setDialog(dialog => {
            return {
                ...(dialog || {}),
                onConfirm() {
                    return null
                },
                Content: () => <UsersReaction message={message} recipients={recipients} />
            }
        })
    }

    const handleSpotlight = () => {
        setSpotlight(s => s && ({ ...s, media: message.content.media!, hash: message.hash }))
    }

    return <div className="d-flex align-items-center message-wrapper my-1"
        id={id}
        data-selected={longPressed}
        {...(!longPressed ? swipeHandlers : {})}
        style={{ transform }}
    >
        {longPressed && <>
            <div className="overlay" onClick={() => setLongPressed(false)}></div>
            <div className="select-reaction" data-reacted={Object.keys(message.reactions || {}).includes(user!._id)}>
                {
                    reactions.map(reaction => (
                        <span key={reaction}
                            data-selected={message.reactions?.[user!._id] === reaction}
                            className="option-reaction"
                            onClick={handleReaction(reaction)}>
                            {reaction}
                        </span>
                    ))
                }
            </div>
        </>}
        <div
            className={`message ${sent ? "sent" : "received"}`}
            onClick={() => !longPressed && sent && handleDisplayTimeStamp()}
            {...longPressHandlers}
        >
            <div className='reactions' onClick={handleReactionsDialog}>
                {
                    message.reactions &&
                    Object.values(message.reactions as Record<string, Reaction>)
                        .reduce((all, reaction) => {
                            const reactionIx = all.findIndex(([_reaction]) => _reaction === reaction)

                            ~reactionIx
                                ? all[reactionIx][1]++
                                : all.push([reaction, 1])

                            return all
                        }, [] as [Reaction, number][])
                        .map(([reaction, count], i) => (
                            <span key={`reaction-${i}`} className="d-flex align-items-center px-1">
                                {reaction}
                                {count > 1 && <span className="count text-white">{count}</span>}
                            </span>
                        ))
                }
            </div>
            {
                message.replyingTo && <div className={`reply mb-0 mt-2`} onClick={handleScrollTo(message.replyingTo!.hash)}>
                    <div className="bg-dark px-3 py-3 mx-2" style={{ borderRadius: '1em' }}>
                        <p className="m-0"><strong>{message.replyingTo.sender.nick}</strong></p>
                        <p className="m-0">{message.replyingTo.content.text}</p>
                    </div>
                </div>
            }
            <div className='py-3'>
                {
                    message.content.media && <>{
                        message.content.media.data !== MEDIA_PLACEHOLDER
                            ?
                            <button className="w-100 rounded-4 mb-3 bg-dark border-0 p-4" onClick={handleSpotlight}>
                                📷 <span className="text-white">Tap to see media</span>
                            </button>
                            :
                            <button className="w-100 rounded-4 mb-3 bg-dark border-0 p-4">
                                📷 <i className="text-white-50">{
                                    isMessageSent(message)
                                        ? 'Sent'
                                        : 'Opened'
                                }</i>
                            </button>
                    }</>
                }
                <span>
                    {
                        message.content.text && message.content.text.split("\n").map((line, i) =>
                            <span key={i} style={{
                                fontSize: emojiRegex.test(message.content.text) ? '3em' : '1em'
                            }}>{
                                    line.split(' ').map((word, i) =>
                                        <React.Fragment key={`word-${i}`}>
                                            {urlRegexp.test(word)
                                                ? <a style={{ color: 'white' }}
                                                    onClick={e => { e.stopPropagation() }}
                                                    href={word.startsWith('http') ? word : `https://${word}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                >
                                                    {word}
                                                </a>
                                                : word}{' '}
                                        </React.Fragment>
                                    )
                                }</span>
                        )
                    }
                    <div className="d-flex align-items-center" style={{
                        float: 'right',
                        marginInlineStart: '1ch',
                        lineHeight: '1.75em'
                    }}>
                        <span style={{ fontSize: '0.6em' }}>{messageTime}</span>
                        {
                            sent &&
                            <Icon className="ms-1" style={{
                                fontSize: '1em',
                                minWidth: 16,
                                maxWidth: 16,
                                color: status === 'read' ? 'var(--msg-tick-read)' : undefined
                            }} />
                        }
                    </div>
                </span>
            </div>

        </div>
        {
            sent &&
            <span className={`timestamp ${show ? "show" : ''}`}>{displayedTimestamp.replace(',', '')}</span>
        }
        <div className="actions-icons-wrapper" style={{ '--transition': replyIconTransition } as CSSProperties}>
            <span className="d-none d-md-block ms-2" onClick={() => setLongPressed(true)}>
                <EmojiSmile />
            </span>
            <span className="ms-2" onClick={() => !isMobile && setReplyingTo(message)}>
                <Reply />
            </span>
        </div>
    </div>
}