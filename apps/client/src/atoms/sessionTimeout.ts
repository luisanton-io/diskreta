import { selector } from "recoil";
import { userState } from "./user";

export const sessionTimeoutState = selector({
    key: "sessionTimeout",
    get: ({ get }) => {
        return get(userState)?.settings.sessionTimeout ?? 15;
    },
    set: ({ set, get }, sessionTimeout) => {
        const user = get(userState);
        if (!user) return;

        set(userState, {
            ...user,
            settings: {
                ...user.settings,
                sessionTimeout: sessionTimeout as number
            }
        });
    }
});