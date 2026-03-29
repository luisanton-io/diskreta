import { SHA256, SHA512 } from "crypto-js";

export default function createChatId(...recipients: string[]) {
    return SHA256(SHA512(recipients.sort().join('')).toString()).toString();
}