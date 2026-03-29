import { AES, enc } from "crypto-js"
import { AtomEffect } from "recoil"
import { getRecoil } from "recoil-nexus"
import { recoilPersist } from "recoil-persist"
import { userState } from "atoms/user"

const encrypt = (message: string) => {
    try {
        const digest = getRecoil(userState)?.digest

        if (!digest) return window.location.assign('/login')

        const value = AES.encrypt(message, digest).toString()
        // console.table({ value, id: getRecoil(userState)?.digest, message })
        return value
    } catch {
        return null
    }
}

const decrypt = (cipher: string) => {
    try {
        const value = AES.decrypt(cipher, getRecoil(userState)?.digest ?? '').toString(enc.Utf8)
        // console.table({ value })
        return value
    } catch {
        return null
    }
}

export const encryptedStorage = () => {
    return {
        setItem: (key: string, value: string) => {
            // console.table({ key, value })
            localStorage.setItem(key, encrypt(value) as string)
        },
        getItem: (key: string) => {
            const a = localStorage.getItem(key)
            // console.table({ decrypted: a && decrypt(a) })
            return a && decrypt(a)
        },
        clear: () => {
            localStorage.clear()
        },
    }
}

const persist = (key: string): { persistAtom: AtomEffect<any> } => { return recoilPersist({ key, storage: encryptedStorage() }) }

export default persist