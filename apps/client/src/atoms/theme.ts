import { selector } from "recoil";
import { userState } from "./user";

export const themeState = selector({
    key: "theme",
    get: ({ get }) => {
        return get(userState)?.settings.theme ?? "Default";
    },
    set: ({ set, get }, theme) => {
        const user = get(userState);
        if (!user) return;

        set(userState, {
            ...user,
            settings: {
                ...user.settings,
                theme: theme as Theme
            }
        });
    }
});