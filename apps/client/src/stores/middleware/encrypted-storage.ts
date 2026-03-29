import { StateStorage } from 'zustand/middleware'
import { AES, enc } from 'crypto-js'

let _digest: string | null = null

export function setEncryptionDigest(digest: string | null) {
    _digest = digest
}

export function getEncryptionDigest() {
    return _digest
}

function encrypt(message: string): string | null {
    try {
        if (!_digest) return null
        return AES.encrypt(message, _digest).toString()
    } catch {
        return null
    }
}

function decrypt(cipher: string): string | null {
    try {
        if (!_digest) return null
        return AES.decrypt(cipher, _digest).toString(enc.Utf8)
    } catch {
        return null
    }
}

export const encryptedStorage: StateStorage = {
    getItem(key: string): string | null {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        return decrypt(raw)
    },
    setItem(key: string, value: string): void {
        const encrypted = encrypt(value)
        if (encrypted) {
            localStorage.setItem(key, encrypted)
        }
    },
    removeItem(key: string): void {
        localStorage.removeItem(key)
    },
}
