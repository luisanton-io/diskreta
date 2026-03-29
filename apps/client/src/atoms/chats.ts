import { atom } from "recoil";
// import { getRecoil } from "recoil-nexus";
import { CHATS, USER, USER_DIGEST } from "constants/localStorage";
import persist from "./effects/persist";
import API from "API";
import { userState } from "./user";

const { persistAtom } = persist(CHATS)

export const defaultChats: Record<string, Chat> = {}

export const chatsState = atom<Record<string, Chat> | null>({
    key: CHATS,
    default: null,
    effects: [
        (effectParams) => {
            const { onSet, getLoadable } = effectParams;
            onSet(newValue => {
                console.debug("Chats changed:", newValue);
                if (!newValue) {
                    // It should never reset chats to null
                    const user = getLoadable(userState).contents
                    API.post('/log', {
                        summary: user.nick + 'chats reset to null',
                        logFileName: `${user.nick}_${Date.now()}.json`,
                        localStorage: {
                            [CHATS]: localStorage.getItem(CHATS),
                            [USER]: localStorage.getItem(USER),
                            [USER_DIGEST]: localStorage.getItem(USER_DIGEST),
                        },
                        decrypted: {
                            "CHATS": getLoadable(chatsState).contents,
                            "USER": getLoadable(userState).contents
                        }
                    })
                }
            });
        },
        persistAtom
    ]
});

// (window as any).chats = () => getRecoil(chatsState)