import { atom } from "recoil";

export const replyingToState = atom<Reply | undefined>({
    key: 'replyTo',
    default: undefined
})