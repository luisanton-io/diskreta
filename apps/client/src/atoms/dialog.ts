import { atom } from "recoil";

export const dialogState = atom<Dialog | null>({
    key: "dialog",
    default: null
});