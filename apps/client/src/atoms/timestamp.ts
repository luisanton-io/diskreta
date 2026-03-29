import { atom } from "recoil";

interface TimestampState {
    index: number
    timeout: NodeJS.Timeout
}

export const timestampState = atom<TimestampState | null>({
    default: null,
    key: "timestamp"
});