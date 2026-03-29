import { AES, enc } from "crypto-js";
import { CHATS, USER } from "constants/localStorage";

interface DecryptionResult {
    // error: Error | null
    chats: Record<string, Chat> | null
    user: LoggedUser
}

export default function decryptLocalStorage(digest: string): DecryptionResult { //throws

    // let error: Error | null = null

    const [chats, user] =
        [localStorage.getItem(CHATS), localStorage.getItem(USER)]
            .map(cipher => {
                // try {
                return cipher && AES.decrypt(cipher, digest).toString(enc.Utf8)
                // } catch {
                //     console.log("Error decrypting")
                //     console.log(cipher, digest)
                //     error = new Error("Error decrypting")
                //     return null
                // }
            })
            .map((json, i) => {
                // console.log(json && JSON.parse(json))
                return json && JSON.parse(json)[[CHATS, USER][i]]
            })

    console.log({ chats, user })

    return { //error, 
        chats,
        user
    }

}