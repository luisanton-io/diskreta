import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { USER } from 'constants/localStorage'
import { encryptedStorage, setEncryptionDigest } from './middleware/encrypted-storage'

interface AuthState {
    user: LoggedUser | null
    setUser: (user: LoggedUser | null) => void
    updateToken: (token: string) => void
    updateTokens: (token: string, refreshToken: string) => void
    updateSettings: (settings: Partial<Settings>) => void
    hydrate: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,

            setUser: (user) => {
                // Update the encryption digest whenever the user changes
                setEncryptionDigest(user?.digest ?? null)
                set({ user })
            },

            updateToken: (token) => {
                const user = get().user
                if (user) {
                    set({ user: { ...user, token } })
                }
            },

            updateTokens: (token, refreshToken) => {
                const user = get().user
                if (user) {
                    set({ user: { ...user, token, refreshToken } })
                }
            },

            updateSettings: (settings) => {
                const user = get().user
                if (user) {
                    set({
                        user: {
                            ...user,
                            settings: { ...user.settings, ...settings },
                        },
                    })
                }
            },

            hydrate: () => {
                // Trigger rehydration from encrypted storage
                // Called after login when the digest is available
                useAuthStore.persist.rehydrate()
            },
        }),
        {
            name: USER,
            storage: createJSONStorage(() => encryptedStorage),
            partialize: (state) => ({ user: state.user }),
            // Skip hydration on startup — digest isn't available yet
            skipHydration: true,
        }
    )
)
